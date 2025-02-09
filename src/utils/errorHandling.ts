// Define Stripe error type
interface StripeError {
  code?: string; // Specific Error
  type?: string; // General Type of Error
  message?: string; // Specific Message
}

export const handlePaymentError = (error: StripeError | unknown) => {
  if (error && typeof error === "object" && "code" in error) {
    // Stripe Error (Reached Stripe servers)
    switch (error.code) {
      case "card_declined":
        return "Your card was declined. Please try another card.";
      case "insufficient_funds":
        return "Insufficient funds in your account.";
      case "expired_card":
        return "This card has expired.";
      case "processing_error":
        return "Payment processing failed. Please try again.";
      default:
        return "Payment failed. Please try again.";
    }
  }

  // Handle non-Stripe errors (Likely network errors)
  return "An error occurred. Please try again.";
};
