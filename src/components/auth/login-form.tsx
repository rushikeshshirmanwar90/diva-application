import { useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { colors } from "@/lib/theme";
import { DEFAULT_CONTACT as CONTACT } from "@/lib/data/contact-defaults";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError, errorMessage } from "@/lib/api/client";
import { isValidEmail } from "@/lib/auth/validation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SocialButtons } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { ErrorBox, Field } from "@/components/ui/field";
import { Sans } from "@/components/ui/text";
import { InlineLink, useNavigate } from "@/components/ui/link";

export function LoginForm({ redirectTo = "/account", initialEmail = "" }: { redirectTo?: string; initialEmail?: string }) {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  /** Set once the customer has tried to submit — an empty field is silent until then. */
  const [touched, setTouched] = useState(false);

  const emailProblem = touched && !email.trim() ? "Enter your email" : touched && !isValidEmail(email) ? "Enter a valid email address" : fieldErrors.email;
  const passwordProblem = touched && !password ? "Enter your password" : fieldErrors.password;
  const canSubmit = email.trim().length > 0 && isValidEmail(email) && password.length > 0;

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(redirectTo, "replace");
    } catch (cause) {
      if (cause instanceof ApiError && cause.details) {
        setFieldErrors(Object.fromEntries(cause.details.map((d) => [d.path, d.message])));
      }
      setError(errorMessage(cause));
      setSubmitting(false);
    }
  };

  const handleGoogle = async (idToken: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await loginWithGoogle(idToken);
      navigate(redirectTo, "replace");
    } catch (cause) {
      setError(errorMessage(cause));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your account"
      intro="Track orders, keep your wishlist across devices and check out in two taps."
      footer={
        <Sans size={14} color={colors.muted}>
          New to Diva?{" "}
          <InlineLink href="/register">
            <Sans size={14} color={colors.charcoal}>
              Create an account
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
            // A field that just failed clears its own error the moment it's edited —
            // a stale "invalid" message under an input you've already fixed reads as broken.
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
            if (error) setError(null);
          }}
          placeholder={CONTACT.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="username"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={emailProblem}
          editable={!submitting}
        />
        <Field
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
            if (error) setError(null);
          }}
          placeholder="••••••••"
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          error={passwordProblem}
          editable={!submitting}
          onSubmitEditing={() => void handleSubmit()}
          hint={
            <InlineLink href={`/forgot-password${email.trim() ? `?email=${encodeURIComponent(email.trim().toLowerCase())}` : ""}`}>
              <Sans size={10} color={colors.goldText} tracking={0.025}>
                Forgot?
              </Sans>
            </InlineLink>
          }
        />
        <Button variant="gold" size="lg" fullWidth loading={submitting} disabled={submitting} onPress={() => void handleSubmit()}>
          Sign in
        </Button>
      </View>
      <SocialButtons onCredential={(t) => void handleGoogle(t)} disabled={submitting} />
    </AuthShell>
  );
}
