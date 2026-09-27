import { AccountShell } from "@/components/account/account-shell";
import { AccountProfileView } from "@/components/account/profile-view";

export default function AccountScreen() {
  return (
    <AccountShell>
      <AccountProfileView />
    </AccountShell>
  );
}
