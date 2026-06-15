export interface SupportFaq {
  question: string;
  answer: string;
}

export interface SupportTopic {
  id: string;
  title: string;
  description: string;
  faqs: SupportFaq[];
}

export const supportTopics: SupportTopic[] = [
  {
    id: "orders",
    title: "Order Tracking",
    description: "Track your order status and delivery updates.",
    faqs: [
      { question: "How can I track my order?", answer: "Sign in and open My Orders to view the latest status for each order. If you cannot sign in, contact support with your order code." },
      { question: "Why has my order not updated?", answer: "Carrier updates can take several hours to appear. If the status has not changed for more than two business days, contact support with the order code." },
      { question: "Can I change my delivery address after ordering?", answer: "Contact support as soon as possible. An address can only be changed before the order enters the delivery stage." },
    ],
  },
  {
    id: "returns",
    title: "Returns",
    description: "Learn about our return and refund process.",
    faqs: [
      { question: "What is your return policy?", answer: "Eligible products can be requested for return within 14 days when they are complete, undamaged, and include the original accessories and packaging." },
      { question: "How do I request a return?", answer: "Open My Orders, identify the order, then contact support with the order code and the reason for the return." },
      { question: "How long does a refund take?", answer: "After the returned product is inspected, refunds usually take 5–10 business days depending on the payment provider." },
    ],
  },
  {
    id: "warranty",
    title: "Warranty",
    description: "Find information about product warranties.",
    faqs: [
      { question: "How long is the warranty?", answer: "Warranty length depends on the product and manufacturer. Check the product details or contact support before purchase for confirmation." },
      { question: "What does the warranty cover?", answer: "Manufacturer warranties generally cover verified hardware faults under normal use, not accidental damage, misuse, or unauthorized repair." },
      { question: "How do I claim warranty service?", answer: "Prepare your order information and a description of the fault, then contact support. Keep the product serial number and included accessories available." },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    description: "Payment methods, billing, and security.",
    faqs: [
      { question: "Which payment methods do you accept?", answer: "The checkout supports cash on delivery and bank-transfer or QR payment when the configured payment provider is available." },
      { question: "Is online payment secure?", answer: "Payment requests are created by the backend and processed through the configured payment provider. The store does not expose provider keys in the browser." },
      { question: "Can I pay on delivery?", answer: "Yes. Choose cash on delivery during checkout when it is available for your order." },
    ],
  },
  {
    id: "account",
    title: "Account",
    description: "Manage sign-in, profile, and order history.",
    faqs: [
      { question: "How do I reset my password?", answer: "Password reset is not automated yet. Use the Forgot Password page to see support options, or contact support using the email registered to your account." },
      { question: "How do I update my account information?", answer: "Sign in and use your account profile when available. Contact support if a field cannot be changed from the current interface." },
      { question: "Can I view my order history?", answer: "Yes. After signing in, choose My Orders from the account menu." },
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    description: "Delivery options, times, and shipping fees.",
    faqs: [
      { question: "How long does delivery take?", answer: "Delivery time depends on location and stock. Most orders should be confirmed before a precise delivery estimate is provided." },
      { question: "How much is shipping?", answer: "The final shipping fee depends on the order and delivery address. Review the checkout summary before confirming payment." },
      { question: "Do you deliver nationwide?", answer: "Delivery coverage depends on the configured carrier. Enter your address during checkout or contact support to confirm remote-area delivery." },
    ],
  },
];

export const supportContext = supportTopics
  .flatMap((topic) => topic.faqs.map((faq) => `${faq.question} ${faq.answer}`))
  .join("\n");
