/** Fallback contact details — used when the backend is unreachable, and as placeholder text. */

export type Contact = {
  phone: string;
  phoneHref: string;
  whatsapp: string;
  whatsappHref: string;
  email: string;
  emailHref: string;
  addressLine: string;
};

export const DEFAULT_CONTACT: Contact = {
  phone: "+91 95798 96842",
  phoneHref: "tel:+919579896842",
  whatsapp: "+91 95798 96842",
  whatsappHref: "https://wa.me/919579896842",
  email: "rushikeshshrimanwar@gmail.com",
  emailHref: "mailto:rushikeshshrimanwar@gmail.com",
  addressLine: "12 Lavelle Road, Bengaluru 560001",
};
