import {
  amountToCents,
  getEntitlement,
  getOrder,
  grantEntitlement,
  revokeEntitlement,
  updateOrder,
  type CommerceOrderStatus,
} from "./commerce";
import type { MercadoPagoPayment } from "./mercadoPago";

const mapMercadoPagoStatus = (status: string | undefined): CommerceOrderStatus => {
  switch (status) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "cancelled":
      return "cancelled";
    case "refunded":
      return "refunded";
    case "charged_back":
      return "charged_back";
    default:
      return "pending";
  }
};

const getPaymentId = (payment: MercadoPagoPayment) => String(payment.id || "");

export const reconcileMercadoPagoPayment = async (payment: MercadoPagoPayment) => {
  const orderId = payment.external_reference || "";
  const paymentId = getPaymentId(payment);

  if (!orderId || !paymentId) {
    return { ignored: true, reason: "missing_order_reference" };
  }

  const order = await getOrder(orderId);

  if (!order) {
    return { ignored: true, reason: "order_not_found" };
  }

  const receivedAmountCents = amountToCents(payment.transaction_amount);
  const amountMatches = receivedAmountCents === order.expectedAmountCents;
  const currencyMatches = (payment.currency_id || order.currencyId) === order.currencyId;
  const previousPaymentIds = Array.isArray(order.paymentIds) ? order.paymentIds : [];
  const paymentIds = Array.from(new Set([...previousPaymentIds, paymentId]));
  const lastPayment = {
    id: paymentId,
    status: payment.status || "unknown",
    statusDetail: payment.status_detail || null,
    amountCents: receivedAmountCents,
    currencyId: payment.currency_id || null,
    paymentMethodId: payment.payment_method_id || null,
    paymentTypeId: payment.payment_type_id || null,
    dateApproved: payment.date_approved || null,
    liveMode: typeof payment.live_mode === "boolean" ? payment.live_mode : null,
    receivedAt: new Date().toISOString(),
  };

  // A sandbox payment must never settle a live order (and vice versa). Orders created before
  // this field existed have no liveMode and skip the check.
  const modeMatches =
    typeof order.liveMode !== "boolean" ||
    typeof payment.live_mode !== "boolean" ||
    order.liveMode === payment.live_mode;

  if (payment.status === "approved" && !modeMatches) {
    await updateOrder(order.id, {
      status: "mode_mismatch",
      paymentIds,
      lastPayment,
      securityFlags: ["mode_mismatch"],
    });

    return { approved: false, status: "mode_mismatch", securityFlags: ["mode_mismatch"] };
  }

  if (payment.status === "approved" && (!amountMatches || !currencyMatches)) {
    const securityFlags = [
      ...(amountMatches ? [] : ["amount_mismatch"]),
      ...(currencyMatches ? [] : ["currency_mismatch"]),
    ];

    await updateOrder(order.id, {
      status: "amount_mismatch",
      paymentIds,
      lastPayment,
      securityFlags,
    });

    return { approved: false, status: "amount_mismatch", securityFlags };
  }

  if (payment.status === "approved") {
    const approvedOrder = await updateOrder(order.id, {
      status: "approved",
      paymentIds,
      lastPayment,
      securityFlags: [],
      approvedAt: payment.date_approved || new Date().toISOString(),
    });

    await grantEntitlement({
      userId: order.userId,
      order: approvedOrder,
      paymentId,
    });

    return { approved: true, status: "approved" };
  }

  const mappedStatus = mapMercadoPagoStatus(payment.status);
  const isReversal =
    mappedStatus === "refunded" || mappedStatus === "charged_back" || mappedStatus === "cancelled";
  const approvedPaymentId =
    order.status === "approved" && typeof order.lastPayment?.id === "string"
      ? order.lastPayment.id
      : null;
  const reversesApprovedPayment = isReversal && approvedPaymentId === paymentId;

  // A late notification for a different payment attempt (an expired Pix, a declined card)
  // must not downgrade an order that was already approved by another payment.
  if (order.status === "approved" && !reversesApprovedPayment) {
    await updateOrder(order.id, { paymentIds });
    return { approved: true, status: "approved", ignoredPaymentStatus: mappedStatus };
  }

  await updateOrder(order.id, {
    status: mappedStatus,
    paymentIds,
    lastPayment,
  });

  if (isReversal) {
    // Only revoke access when the reversed payment is the one that granted it. Otherwise a
    // cancelled attempt from an abandoned order would remove access paid by another order.
    const entitlement = await getEntitlement(order.userId);
    if (entitlement?.active && entitlement.paymentId === paymentId) {
      await revokeEntitlement(order.userId, mappedStatus);
    }
  }

  return { approved: false, status: mappedStatus };
};
