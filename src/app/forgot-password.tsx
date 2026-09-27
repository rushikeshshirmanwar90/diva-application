import { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MailCheck } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { MODEL } from "@/lib/images";
import { DEFAULT_CONTACT as CONTACT } from "@/lib/data/contact-defaults";
import { forgotPassword } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/client";
import { isValidEmail } from "@/lib/auth/validation";
import { Page } from "@/components/layout/page";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { ErrorBox, Field } from "@/components/ui/field";
import { Sans } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/link";

/** Long enough that a tap-happy thumb can't queue several reset emails at once. */
const RESEND_COOLDOWN_S = 30;

/**
 * Asks for the address, then says "check your email" whether or not an
 * account exists — the backend answers identically either way. The link in
 * that email opens the website's reset page; the account is the same one, so
 * the new password works here the moment it is set.
 */
export default function ForgotPasswordScreen() {
  const { email: initial } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(initial ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  const emailProblem = touched && !email.trim() ? "Enter your email" : touched && !isValidEmail(email) ? "Enter a valid email address" : undefined;
  const canSubmit = isValidEmail(email) && resendIn === 0;

  const submit = async () => {
    setTouched(true);
    if (!isValidEmail(email) || resendIn > 0) return;

    setSubmitting(true);
    setError(null);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
      setResendIn(RESEND_COOLDOWN_S);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page footer={false} back>
      {sent ? (
        <AuthShell
          image={MODEL.coinPendant}
          eyebrow="Check your email"
          title="Reset link sent"
          intro={`If there is an account for ${email.trim().toLowerCase()}, a link to choose a new password is on its way. It works for 30 minutes.`}
          footer={
            <Sans size={14} color={colors.muted}>
              Nothing arrived?{" "}
              <Sans
                size={14}
                color={colors.charcoal}
                accessibilityRole="button"
                suppressHighlighting
                onPress={() => {
                  setSent(false);
                  setTouched(false);
                }}
              >
                Try another address
              </Sans>
            </Sans>
          }
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: "rgba(248,245,240,0.5)", padding: 16 }}>
            <MailCheck size={18} strokeWidth={1.5} color={colors.gold} />
            <Sans size={14} style={{ flex: 1 }}>
              Check your spam folder too — the sender is Diva.
            </Sans>
          </View>
          {resendIn === 0 ? (
            <Sans size={12} color={colors.muted} style={{ marginTop: 16 }}>
              Still nothing?{" "}
              <Sans size={12} color={colors.goldText} accessibilityRole="button" suppressHighlighting onPress={() => void submit()}>
                Send it again
              </Sans>
            </Sans>
          ) : (
            <Sans size={12} color={colors.muted} style={{ marginTop: 16 }}>
              You can request another link in {resendIn}s.
            </Sans>
          )}
        </AuthShell>
      ) : (
        <AuthShell
          image={MODEL.coinPendant}
          eyebrow="Forgot your password?"
          title="Reset your password"
          intro="Enter the email you registered with and we'll send a link to choose a new one."
          footer={
            <Sans size={14} color={colors.muted}>
              Remembered it?{" "}
              <InlineLink href="/login">
                <Sans size={14} color={colors.charcoal}>
                  Sign in
                </Sans>
              </InlineLink>
            </Sans>
          }
        >
          <View style={{ gap: 24 }}>
            {error ? <ErrorBox>{error}</ErrorBox> : null}
            <Field
              label="Email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) setError(null);
              }}
              placeholder={CONTACT.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="username"
              returnKeyType="go"
              error={emailProblem}
              editable={!submitting}
              onSubmitEditing={() => void submit()}
            />
            <Button variant="gold" size="lg" fullWidth loading={submitting} disabled={submitting || !canSubmit} onPress={() => void submit()}>
              Send reset link
            </Button>
          </View>
        </AuthShell>
      )}
    </Page>
  );
}
