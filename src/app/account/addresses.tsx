import { AccountShell } from "@/components/account/account-shell";
import { AddressesView } from "@/components/account/addresses-view";

export default function AddressesScreen() {
  return (
    <AccountShell>
      <AddressesView />
    </AccountShell>
  );
}
