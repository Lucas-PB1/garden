import CheckoutReturnPage from "@/features/commerce/components/CheckoutReturnPage";
import { Suspense } from "react";

export default function CheckoutPendingPage() {
  return (
    <Suspense>
      <CheckoutReturnPage kind="pending" />
    </Suspense>
  );
}
