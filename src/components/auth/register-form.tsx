import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { colors } from "@/lib/theme";
import { MODEL } from "@/lib/images";
import { DEFAULT_CONTACT as CONTACT } from "@/lib/data/contact-defaults";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError, errorMessage } from "@/lib/api/client";
import { isValidEmail, isValidIndianPhone, passwordProblem } from "@/lib/auth/validation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SocialButtons } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Checkbox, ErrorBox, Field } from "@/components/ui/field";
import { Eyebrow, Sans } from "@/components/ui/text";
import { InlineLink, useNavigate } from "@/components/ui/link";

/** How long "Resend code" stays disabled after firing — long enough that a tap-happy thumb can't queue five emails. */
const RESEND_COOLDOWN_S = 30;

/** Two steps, one component: the account form, then the OTP the backend sends. */
export function RegisterForm() {
  const navigate = useNavigate();
  const { register, verifyOtp, resendOtp, loginWithGoogle } = useAuth();

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [otp, setOtp] = useState("");
  const [resent, setResent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  /** Once submitted, every field validates live instead of waiting for the next submit attempt. */
  const [touched, setTouched] = useState(false);
  const verifiedOnce = useRef(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** The address already has a verified account — offer the two ways forward. */
  const [taken, setTaken] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  const clearFieldError = (key: string) => {
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    if (error) setError(null);
  };

  const nameProblem = (touched && !name.trim() ? "Give your name" : "") || fieldErrors.name;
  const emailProblem =
    (touched && !email.trim() ? "Enter your email" : touched && !isValidEmail(email) ? "Enter a valid email address" : "") ||
    fieldErrors.email;
  const phoneProblem = (touched && phone.trim() && !isValidIndianPhone(phone) ? "Enter a valid 10-digit Indian mobile number" : "") || fieldErrors.phone;
  const passwordIssue = touched ? passwordProblem(password) : null;
  const passwordFieldError = (passwordIssue ?? "") || fieldErrors.password;

  const canSubmit =
    name.trim().length > 0 &&
    isValidEmail(email) &&
    (phone.trim() === "" || isValidIndianPhone(phone)) &&
    passwordProblem(password) === null;

  const handleGoogle = async (idToken: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await loginWithGoogle(idToken);
      navigate("/account", "replace");
    } catch (cause) {
      setError(errorMessage(cause));
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    setTaken(false);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        marketingOptIn,
      });
      setResendIn(RESEND_COOLDOWN_S);
      setStep("otp");
    } catch (cause) {
      if (cause instanceof ApiError && cause.details) {
        setFieldErrors(Object.fromEntries(cause.details.map((d) => [d.path, d.message])));
      }
      setTaken(cause instanceof ApiError && cause.status === 409);
      setError(errorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (submitting || otp.trim().length !== 6) return;
    setSubmitting(true);
    setError(null);
    try {
      await verifyOtp(email.trim().toLowerCase(), otp.trim());
      navigate("/account", "replace");
    } catch (cause) {
      setError(errorMessage(cause));
      setSubmitting(false);
      // A wrong code should not force retyping the whole thing — just the digits.
      setOtp("");
    }
  };

  // Verifies itself the instant the sixth digit lands — a code this short is
  // never entered "on purpose, then reviewed"; typing the last digit *is* the
  // intent to submit. `verifiedOnce` stops a second, doomed call from firing
  // while the first is still in flight (both would fire on the same render).
  useEffect(() => {
    if (otp.length === 6 && !verifiedOnce.current) {
      verifiedOnce.current = true;
      void handleVerify().finally(() => {
        verifiedOnce.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleResend = async () => {
    if (resendIn > 0) return;
    setError(null);
    setResent(false);
    try {
      await resendOtp(email.trim().toLowerCase());
      setResent(true);
      setResendIn(RESEND_COOLDOWN_S);
    } catch (cause) {
      setError(errorMessage(cause));
    }
  };

  if (step === "otp") {
    const sentTo = email.trim().toLowerCase();
    return (
      <AuthShell
        image={MODEL.coinPendant}
        eyebrow="Check your email"
        title="Verify your address"
        intro={`We sent a 6-digit code to ${sentTo}. It expires in 15 minutes.`}
        footer={
          <Sans size={14} color={colors.muted}>
            Wrong email?{" "}
            <Sans
              size={14}
              color={colors.charcoal}
              accessibilityRole="button"
              suppressHighlighting
              onPress={() => {
                setStep("form");
                setOtp("");
                setError(null);
              }}
            >
              Go back
            </Sans>
          </Sans>
        }
      >
        <View style={{ gap: 24 }}>
          {error ? <ErrorBox>{error}</ErrorBox> : null}
          <Field
            label="6-digit code"
            value={otp}
            onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            autoFocus
            editable={!submitting}
          />
          <Button variant="gold" size="lg" fullWidth loading={submitting} disabled={submitting || otp.length !== 6} onPress={() => void handleVerify()}>
            Verify & continue
          </Button>
          <Pressable onPress={() => void handleResend()} disabled={submitting || resendIn > 0} style={{ alignItems: "center", opacity: submitting || resendIn > 0 ? 0.5 : 1 }}>
            <Eyebrow size={10} color={colors.goldText}>
              {resendIn > 0 ? `Resend code in ${resendIn}s` : resent ? "Code resent" : "Resend code"}
            </Eyebrow>
          </Pressable>
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      image={MODEL.coinPendant}
      eyebrow="Join Diva Circle"
      title="Create your account"
      intro="One account across the website and the app. We verify your email with a one-time code — no password reset emails you'll never read."
      footer={
        <Sans size={14} color={colors.muted}>
          Already have an account?{" "}
          <InlineLink href="/login">
            <Sans size={14} color={colors.charcoal}>
              Sign in
            </Sans>
          </InlineLink>
        </Sans>
      }
    >
      <View style={{ gap: 24 }}>
        {error ? (
          <View style={{ gap: 12 }}>
            <ErrorBox>{error}</ErrorBox>
            {taken ? (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Button variant="outline" size="sm" href={`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`}>
                  Sign in
                </Button>
                <Button variant="ghost" size="sm" href={`/forgot-password?email=${encodeURIComponent(email.trim().toLowerCase())}`}>
                  Reset password
                </Button>
              </View>
            ) : null}
          </View>
        ) : null}
        <Field
          label="Full name"
          value={name}
          onChangeText={(v) => {
            setName(v);
            clearFieldError("name");
          }}
          placeholder="Mahesh Giri"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
          error={nameProblem}
          editable={!submitting}
        />
        <Field
          ref={emailRef}
          label="Email"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            clearFieldError("email");
            setTaken(false);
          }}
          placeholder={CONTACT.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => phoneRef.current?.focus()}
          error={emailProblem}
          editable={!submitting}
        />
        <Field
          ref={phoneRef}
          label="Mobile"
          value={phone}
          onChangeText={(v) => {
            setPhone(v.replace(/[^\d+]/g, ""));
            clearFieldError("phone");
          }}
          placeholder={CONTACT.phone}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={phoneProblem}
          editable={!submitting}
        />
        <Field
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            clearFieldError("password");
          }}
          placeholder="At least 10 characters"
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={() => void handleSubmit()}
          error={passwordFieldError}
          editable={!submitting}
        />
        <Checkbox checked={marketingOptIn} onChange={setMarketingOptIn} disabled={submitting}>
          <Sans size={12} leading="relaxed" color={colors.muted}>
            Send me one letter a month about new pieces and where the gold rate has moved. No daily mail, ever.
          </Sans>
        </Checkbox>
        <Button variant="gold" size="lg" fullWidth loading={submitting} disabled={submitting} onPress={() => void handleSubmit()}>
          Create account
        </Button>
      </View>
      <SocialButtons onCredential={(t) => void handleGoogle(t)} disabled={submitting} />
    </AuthShell>
  );
}
