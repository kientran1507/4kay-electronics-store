const { PayOS } = require("@payos/node");

const hasPayosConfig = () =>
  Boolean(
    process.env.PAYOS_CLIENT_ID
    && process.env.PAYOS_API_KEY
    && process.env.PAYOS_CHECKSUM_KEY
  );

const getClient = () => new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

const createOrderCode = () => (Date.now() * 100) + Math.floor(Math.random() * 100);

const createPayosPayment = async ({ orderId, amount }) => {
  if (!hasPayosConfig()) {
    throw new Error("payOS credentials are not configured.");
  }

  const orderCode = createOrderCode();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const paymentLink = await getClient().paymentRequests.create({
    orderCode,
    amount: Math.round(amount),
    description: `4KAY ${String(orderCode).slice(-12)}`,
    returnUrl: `${frontendUrl}/payment/result?orderId=${orderId}&result=success`,
    cancelUrl: `${frontendUrl}/payment/result?orderId=${orderId}&result=cancelled`,
  });

  return {
    orderId,
    orderCode,
    paymentLinkId: paymentLink.paymentLinkId,
    paymentUrl: paymentLink.checkoutUrl,
    qrCode: "",
    amount: paymentLink.amount,
    status: String(paymentLink.status || "PENDING").toLowerCase(),
    provider: "payos",
    message: "Secure payment link created.",
  };
};

const verifyPayosWebhook = async (body) => {
  if (!hasPayosConfig()) {
    throw new Error("payOS webhook handling is not configured.");
  }
  return getClient().webhooks.verify(body);
};

const getPayosPayment = async (orderCode) => {
  if (!hasPayosConfig() || !orderCode) return null;
  return getClient().paymentRequests.get(Number(orderCode));
};

module.exports = {
  createPayosPayment,
  getPayosPayment,
  hasPayosConfig,
  verifyPayosWebhook,
};
