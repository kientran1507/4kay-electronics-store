const Order = require("../models/orderModel");
const Product = require("../models/productModel");

function combineItems(items = []) {
  const quantities = new Map();

  for (const item of items) {
    const productId = String(item.productId || "");
    const quantity = Number(item.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      const error = new Error("Order contains an invalid product quantity.");
      error.statusCode = 400;
      throw error;
    }
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }

  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
}

async function restoreInventory(items = []) {
  const combinedItems = combineItems(items);
  if (!combinedItems.length) return;

  await Product.bulkWrite(
    combinedItems.map(({ productId, quantity }) => ({
      updateOne: {
        filter: { _id: productId },
        update: { $inc: { stock: quantity } },
      },
    })),
  );
}

async function reserveInventory(items = []) {
  const combinedItems = combineItems(items);
  const reservedItems = [];

  try {
    for (const { productId, quantity } of combinedItems) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true, runValidators: true },
      );

      if (!product) {
        const error = new Error("One or more products no longer have enough stock.");
        error.statusCode = 409;
        error.productId = productId;
        throw error;
      }

      reservedItems.push({ productId, quantity });
    }

    return reservedItems;
  } catch (error) {
    if (reservedItems.length) await restoreInventory(reservedItems);
    throw error;
  }
}

async function releaseOrderInventory(order) {
  if (!order?._id) return false;

  const releasedAt = new Date();
  const claimedOrder = await Order.findOneAndUpdate(
    { _id: order._id, inventoryReleasedAt: null },
    { $set: { inventoryReleasedAt: releasedAt } },
    { new: true },
  );

  if (!claimedOrder) return false;

  try {
    await restoreInventory(claimedOrder.items || order.items || []);
    return true;
  } catch (error) {
    await Order.updateOne(
      { _id: order._id, inventoryReleasedAt: releasedAt },
      { $set: { inventoryReleasedAt: null } },
    );
    throw error;
  }
}

module.exports = {
  combineItems,
  releaseOrderInventory,
  reserveInventory,
  restoreInventory,
};
