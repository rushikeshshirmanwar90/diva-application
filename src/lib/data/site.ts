import { apiGetOrNull } from "@/lib/api/client";
import { DEFAULT_CONTACT, type Contact } from "@/lib/data/contact-defaults";
import { faqs as defaultFaqs } from "@/lib/data/content";

export type { Contact };

export type StoreLocation = {
  city: string;
  tag: string;
  address: string;
  phone: string;
  hours: string;
  note?: string;
};

export type FaqGroup = {
  group: string;
  items: { q: string; a: string }[];
};

export type HelpLink = {
  label: string;
  href: string;
  openInNewTab: boolean;
};

export const DEFAULT_HELP_LINKS: HelpLink[] = [
  { label: "FAQ", href: "/faq", openInNewTab: false },
  { label: "Shipping", href: "/policies/shipping", openInNewTab: false },
  { label: "Returns & exchange", href: "/policies/returns", openInNewTab: false },
  { label: "Privacy policy", href: "/policies/privacy", openInNewTab: false },
  { label: "Terms of service", href: "/policies/terms", openInNewTab: false },
  { label: "My account", href: "/account", openInNewTab: false },
];

export type HelpCard = {
  title: string;
  body: string;
  href: string;
  cta: string;
};

export type HelpPage = {
  eyebrow: string;
  title: string;
  description: string;
  cards: HelpCard[];
};

export const DEFAULT_HELP_CARDS: HelpCard[] = [
  {
    title: "Track an order",
    body: "See where your order is, download invoices and request a return from your account.",
    href: "/account/orders",
    cta: "My orders",
  },
  {
    title: "Planning a wedding?",
    body: "Bridal orders take 6–8 weeks. Here is the timeline we recommend.",
    href: "/blog/bridal-timeline-eight-weeks",
    cta: "Read the guide",
  },
];

export type SiteSettings = {
  contact: Contact;
  storeName: string;
  supportHours: string;
  footerBlurb: string;
  copyrightText: string;
  paymentMethodsNote: string;
  helpLinks: HelpLink[];
  helpPage: HelpPage;
  contactPage: {
    eyebrow: string;
    title: string;
    description: string;
    stores: StoreLocation[];
  };
  faqs: FaqGroup[];
};

type ApiSettings = {
  storeName?: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber?: string;
  supportHours?: string;
  address: { line1: string; line2?: string; city: string; state: string; pincode: string; country: string };
  footerBlurb?: string;
  copyrightText?: string;
  paymentMethodsNote?: string;
  helpLinks?: { label: string; href: string; isActive?: boolean; openInNewTab?: boolean }[];
  helpPage?: { eyebrow?: string; title?: string; description?: string; cards?: HelpCard[] };
  contactPage?: { eyebrow?: string; title?: string; description?: string; stores?: StoreLocation[] };
  faqs?: FaqGroup[];
};

function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function toWhatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

const DEFAULT_STORES: StoreLocation[] = [
  {
    city: "Bengaluru",
    tag: "Flagship",
    address: DEFAULT_CONTACT.addressLine,
    phone: DEFAULT_CONTACT.phone,
    hours: "Mon–Sat 10:30–20:00 · Sun 11:00–18:00",
    note: "Bridal appointments and purity assays available here.",
  },
  {
    city: "Chennai",
    tag: "Counter",
    address: "48 Nungambakkam High Road, Chennai 600034",
    phone: DEFAULT_CONTACT.phone,
    hours: "Mon–Sat 10:30–20:00 · Sun closed",
    note: "Temple and 22K collections held in depth.",
  },
  {
    city: "Hyderabad",
    tag: "Counter",
    address: "9 Road No. 12, Banjara Hills, Hyderabad 500034",
    phone: DEFAULT_CONTACT.phone,
    hours: "Tue–Sun 11:00–20:00 · Mon closed",
    note: "Polki and diamond bridal, by appointment on weekends.",
  },
];

function isSafeHref(href: string): boolean {
  return /^\/(?!\/)/.test(href) || /^https?:\/\//i.test(href);
}

export function fallbackSiteSettings(): SiteSettings {
  return {
    contact: DEFAULT_CONTACT,
    storeName: "DIVA",
    supportHours: "Mon–Sat, 9:00–21:00 IST",
    footerBlurb:
      "Fine jewellery made in Bengaluru and Jaipur since 1998. Every piece is hallmarked, priced transparently, and made to be worn — not stored.",
    copyrightText: "© 2026 Diva The Indian Jewel · GSTIN 29AABCD1234E1ZQ",
    paymentMethodsNote: "UPI · Cards · Net banking · No-cost EMI",
    helpLinks: DEFAULT_HELP_LINKS,
    helpPage: {
      eyebrow: "Help centre",
      title: "Questions, answered plainly",
      description:
        "If your question is not here, WhatsApp us — a person replies, usually within ten minutes.",
      cards: DEFAULT_HELP_CARDS,
    },
    contactPage: {
      eyebrow: "We answer in under four hours",
      title: "Talk to a person",
      description:
        "No chatbots. Messages reach the same team that handles the counters, and bridal enquiries go straight to a senior consultant.",
      stores: DEFAULT_STORES,
    },
    faqs: defaultFaqs as FaqGroup[],
  };
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const d = await apiGetOrNull<ApiSettings>("/settings");
  if (!d) return fallbackSiteSettings();

  const supportPhone = d.supportPhone || DEFAULT_CONTACT.phone;
  const supportEmail = d.supportEmail || DEFAULT_CONTACT.email;
  const whatsapp = d.whatsappNumber || supportPhone;
  const addressLine = d.address
    ? [d.address.line1, d.address.line2, `${d.address.city} ${d.address.pincode}`]
        .filter(Boolean)
        .join(", ")
    : DEFAULT_CONTACT.addressLine;

  const contact: Contact = {
    phone: supportPhone,
    phoneHref: toTelHref(supportPhone),
    whatsapp,
    whatsappHref: toWhatsappHref(whatsapp),
    email: supportEmail,
    emailHref: `mailto:${supportEmail}`,
    addressLine,
  };

  const fallback = fallbackSiteSettings();

  return {
    contact,
    storeName: d.storeName || "DIVA",
    supportHours: d.supportHours || fallback.supportHours,
    footerBlurb: d.footerBlurb || fallback.footerBlurb,
    copyrightText: d.copyrightText || fallback.copyrightText,
    paymentMethodsNote: d.paymentMethodsNote || fallback.paymentMethodsNote,
    helpLinks: d.helpLinks
      ? d.helpLinks
          .filter((link) => link.isActive !== false && isSafeHref(link.href))
          .map((link) => ({
            label: link.label,
            href: link.href,
            openInNewTab: link.openInNewTab ?? false,
          }))
      : DEFAULT_HELP_LINKS,
    helpPage: {
      eyebrow: d.helpPage?.eyebrow || fallback.helpPage.eyebrow,
      title: d.helpPage?.title || fallback.helpPage.title,
      description: d.helpPage?.description || fallback.helpPage.description,
      cards: d.helpPage?.cards ? d.helpPage.cards.filter((card) => isSafeHref(card.href)) : DEFAULT_HELP_CARDS,
    },
    contactPage: {
      eyebrow: d.contactPage?.eyebrow || fallback.contactPage.eyebrow,
      title: d.contactPage?.title || fallback.contactPage.title,
      description: d.contactPage?.description || fallback.contactPage.description,
      stores: d.contactPage?.stores?.length ? d.contactPage.stores : DEFAULT_STORES,
    },
    faqs: d.faqs?.length ? d.faqs : (defaultFaqs as FaqGroup[]),
  };
}
