import Stripe from "stripe";
import { env, isStripeConfigured } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey);
  }

  return stripeClient;
}
