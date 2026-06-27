const test = require("node:test");
const assert = require("node:assert/strict");
const {
  FREE_SHIPPING_MIN,
  calculateShippingFee,
  calculateVoucherDiscount,
  detectShippingZone,
  validateVoucher,
} = require("../services/pricingService");

test("same-city shipping is cheaper than national shipping", () => {
  const sameCity = calculateShippingFee(1000000, "118 Nguyen Xien, Thu Duc, Ho Chi Minh");
  const national = calculateShippingFee(1000000, "Hoan Kiem, Ha Noi");

  assert.equal(sameCity.shippingZone, "same_city");
  assert.equal(national.shippingZone, "national");
  assert.ok(sameCity.shippingFee < national.shippingFee);
});

test("large orders qualify for free shipping", () => {
  const quote = calculateShippingFee(30000000, "Da Nang");

  assert.equal(quote.shippingFee, 0);
  assert.equal(quote.shippingLabel, "Free shipping");
});

test("free shipping starts exactly at the configured threshold", () => {
  const belowThreshold = calculateShippingFee(FREE_SHIPPING_MIN - 1, "Da Nang");
  const atThreshold = calculateShippingFee(FREE_SHIPPING_MIN, "Da Nang");

  assert.ok(belowThreshold.shippingFee > 0);
  assert.equal(atThreshold.shippingFee, 0);
});

test("shipping zone detection handles nearby, remote, and national addresses", () => {
  assert.equal(detectShippingZone("Di An, Binh Duong").key, "nearby_province");
  assert.equal(detectShippingZone("Ha Giang city").key, "remote_area");
  assert.equal(detectShippingZone("Hai Chau, Da Nang").key, "national");
});

test("percentage voucher respects maximum discount", () => {
  const voucher = { type: "percentage", value: 20, maxDiscount: 1000000 };

  assert.equal(calculateVoucherDiscount(voucher, 10000000), 1000000);
});

test("fixed voucher never discounts more than subtotal", () => {
  const voucher = { type: "fixed", value: 500000 };

  assert.equal(calculateVoucherDiscount(voucher, 300000), 300000);
});

test("voucher validation rejects expired, low-value, and category-mismatched carts", () => {
  const items = [{ product: { category: "Laptop", _id: "p1" } }];
  const expired = validateVoucher(
    { active: true, minOrderValue: 0, endDate: new Date("2020-01-01") },
    1000000,
    items,
  );
  const lowValue = validateVoucher(
    { active: true, minOrderValue: 2000000 },
    1000000,
    items,
  );
  const categoryMismatch = validateVoucher(
    { active: true, minOrderValue: 0, appliesToCategories: ["Phone"], appliesToProducts: [] },
    1000000,
    items,
  );

  assert.equal(expired.valid, false);
  assert.equal(lowValue.valid, false);
  assert.equal(categoryMismatch.valid, false);
});
