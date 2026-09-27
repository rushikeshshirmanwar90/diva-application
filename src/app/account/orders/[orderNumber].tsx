import { useLocalSearchParams } from "expo-router";
import { AccountShell } from "@/components/account/account-shell";
import { OrderDetailView } from "@/components/account/order-detail-view";

export default function OrderDetailScreen() {
  const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();
  return (
    <AccountShell>
      <OrderDetailView orderNumber={orderNumber} />
    </AccountShell>
  );
}
