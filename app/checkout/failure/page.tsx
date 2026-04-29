import CheckoutReturnPage from "@/features/commerce/components/CheckoutReturnPage";
import { Suspense } from "react";

export default function CheckoutFailurePage() {
  return (
    <Suspense>
      <CheckoutReturnPage kind="failure" />
    </Suspense>
  );
}
