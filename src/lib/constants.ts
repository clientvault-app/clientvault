export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    maxClients: 2,
    maxStorageBytes: 1 * 1024 * 1024 * 1024, // 1GB
    features: [
      "2 client portals",
      "1GB file storage",
      "Basic file sharing",
      "ClientVault branding",
    ],
    stripePriceId: null,
  },
  pro: {
    name: "Pro",
    price: 19,
    maxClients: 25,
    maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10GB
    features: [
      "25 client portals",
      "10GB file storage",
      "Custom branding",
      "Invoicing & payments",
      "Email notifications",
      "Priority support",
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  agency: {
    name: "Agency",
    price: 49,
    maxClients: -1, // unlimited
    maxStorageBytes: 50 * 1024 * 1024 * 1024, // 50GB
    features: [
      "Unlimited client portals",
      "50GB file storage",
      "White-label (remove branding)",
      "Team seats (coming soon)",
      "Advanced analytics",
      "API access",
      "Dedicated support",
    ],
    stripePriceId: process.env.STRIPE_AGENCY_PRICE_ID,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const APP_NAME = "ClientVault";
export const APP_DESCRIPTION =
  "The modern client portal for agencies & freelancers. Share files, collect feedback, and get paid — all in one beautiful link.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
