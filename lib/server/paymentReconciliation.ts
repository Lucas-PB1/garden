import {
  amountToCents,
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
    receivedAt: new Date().toISOString(),
  };

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

  await updateOrder(order.id, {
    status: mappedStatus,
    paymentIds,
    lastPayment,
  });

  if (
    mappedStatus === "refunded" ||
    mappedStatus === "charged_back" ||
    mappedStatus === "cancelled"
  ) {
    await revokeEntitlement(order.userId, mappedStatus);
  }

  return { approved: false, status: mappedStatus };
};
