import { apiFetch } from "@/lib/api/client";

export type AddressType = "HOME" | "WORK" | "OTHER";

export type Address = {
  _id: string;
  label?: string;
  type: AddressType;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
};

export type AddressInput = {
  label?: string;
  type?: AddressType;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
};

export function listAddresses() {
  return apiFetch<Address[]>("/addresses");
}

export function createAddress(input: AddressInput) {
  return apiFetch<Address>("/addresses", { method: "POST", body: input });
}

export function updateAddress(id: string, input: Partial<AddressInput>) {
  return apiFetch<Address>(`/addresses/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteAddress(id: string) {
  return apiFetch<{ deleted: true }>(`/addresses/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
