import { loadStripe } from "@stripe/stripe-js";

// Returns secure connection to stripe using our public key
export const getStripe = () => {
  const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

  if (!stripePublicKey) {
    throw new Error("Missing Stripe public key");
  }

  return loadStripe(stripePublicKey);
};

// Helper to format amount for Stripe (converts dollars to cents)
export const formatAmountForStripe = (amount: number) => {
  return Math.round(amount * 100);
};
