import CheckoutReturnPage from "@/features/commerce/components/CheckoutReturnPage";
import { Suspense } from "react";

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutReturnPage kind="success" />
    </Suspense>
  );
}
