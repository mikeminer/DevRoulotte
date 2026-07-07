import { z } from "zod";
import type { PremiumCard } from "@/lib/types";

const textField = (maxLength: number) =>
  z
    .string()
    .max(maxLength)
    .optional()
    .default("")
    .transform((value) => value.trim());

export const premiumCardInputSchema = z.object({
  displayName: textField(80),
  headline: textField(120),
  bio: textField(420),
  websiteUrl: textField(240),
  githubUrl: textField(240),
  linkedinUrl: textField(240),
  xUrl: textField(240),
  productUrl: textField(240),
  contactEmail: textField(160),
  preferredContact: textField(120),
  stack: textField(180),
  lookingFor: textField(220),
  building: textField(220),
  ctaLabel: textField(50),
  ctaUrl: textField(240),
  shareInCalls: z.boolean().optional().default(false),
});

export type PremiumCardInput = z.infer<typeof premiumCardInputSchema>;

export type PremiumCardRow = {
  user_id: string;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  website_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  x_url: string | null;
  product_url: string | null;
  contact_email: string | null;
  preferred_contact: string | null;
  stack: string | null;
  looking_for: string | null;
  building: string | null;
  cta_label: string | null;
  cta_url: string | null;
  share_in_calls: boolean | null;
  updated_at: string | null;
};

export const premiumCardSelect = [
  "user_id",
  "display_name",
  "headline",
  "bio",
  "website_url",
  "github_url",
  "linkedin_url",
  "x_url",
  "product_url",
  "contact_email",
  "preferred_contact",
  "stack",
  "looking_for",
  "building",
  "cta_label",
  "cta_url",
  "share_in_calls",
  "updated_at",
].join(",");

export const emptyPremiumCard: PremiumCard = {
  displayName: "",
  headline: "",
  bio: "",
  websiteUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  xUrl: "",
  productUrl: "",
  contactEmail: "",
  preferredContact: "",
  stack: "",
  lookingFor: "",
  building: "",
  ctaLabel: "",
  ctaUrl: "",
  shareInCalls: false,
  updatedAt: null,
};

function normalizeHttpUrl(value: string, fieldName: string) {
  if (!value) {
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const parsed = new URL(withProtocol);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error();
    }

    parsed.hash = "";
    return parsed.toString().slice(0, 240);
  } catch {
    throw new Error(`${fieldName} non e' un URL valido`);
  }
}

function normalizeEmail(value: string) {
  if (!value) {
    return "";
  }

  const email = value.toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email di contatto non valida");
  }

  return email;
}

export function normalizePremiumCard(raw: unknown): PremiumCardInput {
  const parsed = premiumCardInputSchema.parse(raw);

  return {
    ...parsed,
    websiteUrl: normalizeHttpUrl(parsed.websiteUrl, "Sito web"),
    githubUrl: normalizeHttpUrl(parsed.githubUrl, "GitHub"),
    linkedinUrl: normalizeHttpUrl(parsed.linkedinUrl, "LinkedIn"),
    xUrl: normalizeHttpUrl(parsed.xUrl, "X"),
    productUrl: normalizeHttpUrl(parsed.productUrl, "Prodotto"),
    ctaUrl: normalizeHttpUrl(parsed.ctaUrl, "Call to action"),
    contactEmail: normalizeEmail(parsed.contactEmail),
  };
}

export function premiumCardFromRow(row: PremiumCardRow): PremiumCard {
  return {
    displayName: row.display_name ?? "",
    headline: row.headline ?? "",
    bio: row.bio ?? "",
    websiteUrl: row.website_url ?? "",
    githubUrl: row.github_url ?? "",
    linkedinUrl: row.linkedin_url ?? "",
    xUrl: row.x_url ?? "",
    productUrl: row.product_url ?? "",
    contactEmail: row.contact_email ?? "",
    preferredContact: row.preferred_contact ?? "",
    stack: row.stack ?? "",
    lookingFor: row.looking_for ?? "",
    building: row.building ?? "",
    ctaLabel: row.cta_label ?? "",
    ctaUrl: row.cta_url ?? "",
    shareInCalls: Boolean(row.share_in_calls),
    updatedAt: row.updated_at,
  };
}

export function premiumCardToRow(userId: string, card: PremiumCardInput) {
  return {
    user_id: userId,
    display_name: card.displayName,
    headline: card.headline,
    bio: card.bio,
    website_url: card.websiteUrl,
    github_url: card.githubUrl,
    linkedin_url: card.linkedinUrl,
    x_url: card.xUrl,
    product_url: card.productUrl,
    contact_email: card.contactEmail,
    preferred_contact: card.preferredContact,
    stack: card.stack,
    looking_for: card.lookingFor,
    building: card.building,
    cta_label: card.ctaLabel,
    cta_url: card.ctaUrl,
    share_in_calls: card.shareInCalls,
  };
}

export function hasVisiblePremiumCardContent(card: PremiumCard) {
  return Boolean(
    card.displayName ||
      card.headline ||
      card.bio ||
      card.websiteUrl ||
      card.githubUrl ||
      card.linkedinUrl ||
      card.xUrl ||
      card.productUrl ||
      card.contactEmail ||
      card.preferredContact ||
      card.stack ||
      card.lookingFor ||
      card.building ||
      card.ctaUrl,
  );
}
