import { Page } from "@/components/layout/page";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterScreen() {
  return (
    <Page footer={false}>
      <RegisterForm />
    </Page>
  );
}
