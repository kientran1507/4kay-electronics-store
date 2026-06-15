const paymentStore = new Map();

const createManualPayment = ({ orderId, amount }) => {
  const payment = {
    orderId,
    paymentUrl: "",
    qrCode: process.env.MANUAL_BANK_QR || "",
    amount,
    status: "pending",
    provider: "manual_bank_transfer",
    message: "payOS keys are missing. Show manual bank transfer QR or use COD fallback.",
  };
  paymentStore.set(String(orderId), payment);
  return payment;
};

const savePayment = (payment) => {
  paymentStore.set(String(payment.orderId), payment);
  return payment;
};

const getPaymentStatus = (orderId) =>
  paymentStore.get(String(orderId)) || {
    orderId,
    status: "unknown",
    message: "No payment session found for this order.",
  };

const markPaid = (orderId) => {
  const current = getPaymentStatus(orderId);
  const next = { ...current, status: "paid" };
  paymentStore.set(String(orderId), next);
  return next;
};

module.exports = {
  createManualPayment,
  getPaymentStatus,
  markPaid,
  savePayment,
};
