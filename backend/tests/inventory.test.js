const test = require("node:test");
const assert = require("node:assert/strict");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const {
  combineItems,
  releaseOrderInventory,
  reserveInventory,
} = require("../services/inventoryService");

test("duplicate product lines are combined before reserving stock", () => {
  assert.deepEqual(
    combineItems([
      { productId: "product-1", quantity: 2 },
      { productId: "product-1", quantity: 3 },
    ]),
    [{ productId: "product-1", quantity: 5 }],
  );
});

test("concurrent reservations cannot oversell five units", async () => {
  const originalFindOneAndUpdate = Product.findOneAndUpdate;
  const originalBulkWrite = Product.bulkWrite;
  let stock = 5;

  Product.findOneAndUpdate = async (filter, update) => {
    const quantity = -update.$inc.stock;
    if (stock < quantity) return null;
    stock -= quantity;
    return { _id: filter._id, stock };
  };
  Product.bulkWrite = async (operations) => {
    for (const operation of operations) stock += operation.updateOne.update.$inc.stock;
  };

  try {
    const results = await Promise.allSettled([
      reserveInventory([{ productId: "product-1", quantity: 2 }]),
      reserveInventory([{ productId: "product-1", quantity: 4 }]),
    ]);

    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(results.filter((result) => result.status === "rejected").length, 1);
    assert.ok(stock >= 0);
    assert.ok(stock === 1 || stock === 3);
  } finally {
    Product.findOneAndUpdate = originalFindOneAndUpdate;
    Product.bulkWrite = originalBulkWrite;
  }
});

test("cancelling an order restores inventory only once", async () => {
  const originalFindOneAndUpdate = Order.findOneAndUpdate;
  const originalUpdateOne = Order.updateOne;
  const originalBulkWrite = Product.bulkWrite;
  let claimed = false;
  let stock = 3;
  const order = {
    _id: "order-1",
    items: [{ productId: "product-1", quantity: 2 }],
  };

  Order.findOneAndUpdate = async () => {
    if (claimed) return null;
    claimed = true;
    return order;
  };
  Order.updateOne = async () => {};
  Product.bulkWrite = async (operations) => {
    for (const operation of operations) stock += operation.updateOne.update.$inc.stock;
  };

  try {
    assert.equal(await releaseOrderInventory(order), true);
    assert.equal(await releaseOrderInventory(order), false);
    assert.equal(stock, 5);
  } finally {
    Order.findOneAndUpdate = originalFindOneAndUpdate;
    Order.updateOne = originalUpdateOne;
    Product.bulkWrite = originalBulkWrite;
  }
});
