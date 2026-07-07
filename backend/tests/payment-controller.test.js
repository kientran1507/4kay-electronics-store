const test = require("node:test");
const assert = require("node:assert/strict");
const { _test } = require("../controllers/paymentController");

test("payOS provider statuses map to local payment statuses", () => {
  assert.equal(_test.mapProviderStatus("PAID"), "paid");
  assert.equal(_test.mapProviderStatus("CANCELLED"), "cancelled");
  assert.equal(_test.mapProviderStatus("EXPIRED"), "cancelled");
  assert.equal(_test.mapProviderStatus("FAILED"), "failed");
  assert.equal(_test.mapProviderStatus("UNDERPAID"), "failed");
  assert.equal(_test.mapProviderStatus("PENDING"), "pending");
});

test("paid payOS orders use a valid localized processing status", () => {
  assert.equal(_test.PROCESSING_STATUS, "Chờ xử lý");
});

test("payment serialization exposes only checkout metadata", () => {
  const order = {
    _id: "order-id",
    paymentOrderCode: 123,
    paymentLinkId: "link-id",
    paymentUrl: "https://pay.example/checkout",
    paymentQrCode: "",
    totalPrice: 990000,
    paymentStatus: "pending",
    paymentProvider: "payos",
  };

  assert.deepEqual(_test.serializePayment(order), {
    orderId: "order-id",
    orderCode: 123,
    paymentLinkId: "link-id",
    paymentUrl: "https://pay.example/checkout",
    qrCode: "",
    amount: 990000,
    status: "pending",
    provider: "payos",
  });
});
