// pages/api/webhook.ts
import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// Disable body parsing, need raw body for Stripe webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"]!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.log(`❌ Error message: ${(err as Error).message}`);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  // Handle different event types
  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("Session data:", session); // Log full session data
        const projectId = session.metadata?.projectId;
        const userId = session.metadata?.userId;

        console.log("ProjectId from metadata:", projectId); // Log projectId
        console.log("Full metadata:", session.metadata); // Log all metadata

        if (!projectId) {
          console.error("projectId not found in metadata", session.metadata);
          throw new Error("Missing projectId in metadata");
        }

        const amount = session.amount_total! / 100;
        console.log("Amount:", amount); // Log amount

        const dbResponse = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/donations`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId,
              amount,
              userId,
            }),
          }
        );

        // Log the response from the donations API
        console.log("DB Response status:", dbResponse.status);
        const responseText = await dbResponse.text();
        console.log("DB Response body:", responseText);

        if (!dbResponse.ok) {
          throw new Error(`Failed to record donation: ${responseText}`);
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log(`❌ Payment failed: ${failedPayment.id}`);
        // TODO: Handle failed payment
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.log(err);
    res.status(500).send(`Webhook Error: ${err}`);
  }
}
