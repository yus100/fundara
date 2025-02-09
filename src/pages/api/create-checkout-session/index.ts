import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { formatAmountForStripe } from "@/utils/stripe";
import { getAuth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Auth check
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Body validation
    const { projectId, amount } = req.body;
    if (!projectId || !amount) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Amount validation
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Project Donation",
              description: " ",
            },
            unit_amount: formatAmountForStripe(amount),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
      metadata: {
        projectId: projectId,
        userId: userId,
      },
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error creating checkout session" });
  }
}
