import { useEffect, useRef, useState } from "react";
import { lookupPincode, type PincodeInfo } from "@/lib/address-regions";

export type PincodeStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "found"; info: PincodeInfo }
  | { kind: "not-found" };

/**
 * Looks up a 6-digit pincode with India Post as it's typed and calls
 * `onFound` once per new pincode, so the form can set state and city.
 */
export function usePincode(pincode: string, onFound: (info: PincodeInfo) => void): PincodeStatus {
  const [answer, setAnswer] = useState<{ pin: string; info: PincodeInfo | null } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const onFoundRef = useRef(onFound);
  useEffect(() => {
    onFoundRef.current = onFound;
  });

  const valid = /^[1-9]\d{5}$/.test(pincode);

  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      lookupPincode(pincode, controller.signal)
        .then((info) => {
          setAnswer({ pin: pincode, info });
          if (info) onFoundRef.current(info);
        })
        .catch(() => {
          // Network trouble shouldn't block the form — just show nothing.
          if (!controller.signal.aborted) setFailed(pincode);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [pincode, valid]);

  if (!valid || failed === pincode) return { kind: "idle" };
  if (answer?.pin !== pincode) return { kind: "checking" };
  return answer.info ? { kind: "found", info: answer.info } : { kind: "not-found" };
}
