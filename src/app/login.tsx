import { useLocalSearchParams } from "expo-router";
import { Page } from "@/components/layout/page";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginScreen() {
  /** Where to land after signing in — checkout sends people here with `?redirect=/checkout`. */
  const { redirect, email } = useLocalSearchParams<{ redirect?: string; email?: string }>();
  return (
    <Page footer={false}>
      <LoginForm redirectTo={redirect && redirect.startsWith("/") ? redirect : "/account"} initialEmail={email ?? ""} />
    </Page>
  );
}
