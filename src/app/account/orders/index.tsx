import { AccountShell } from "@/components/account/account-shell";
import { OrdersListView } from "@/components/account/orders-list-view";

export default function OrdersScreen() {
  return (
    <AccountShell>
      <OrdersListView />
    </AccountShell>
  );
}
