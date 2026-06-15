const test = require("node:test");
const assert = require("node:assert/strict");
const { toPublicCustomer } = require("../controllers/customerController");
const { pickProductFields, escapeRegex } = require("../controllers/productController");
const { formatCart } = require("../controllers/cartController");
const productRoutes = require("../routes/productRoutes");

test("customer DTO excludes password data", () => {
  const customer = toPublicCustomer({
    _id: "customer-1",
    name: "Test Customer",
    email: "test@example.com",
    password: "hashed-secret",
    phone: "123",
    address: "Address",
  });

  assert.equal(customer.email, "test@example.com");
  assert.equal("password" in customer, false);
});

test("product updates keep only known fields and preserve omitted fields", () => {
  const update = pickProductFields({
    name: "Laptop",
    rating: 4.7,
    unknownField: "ignored",
  });

  assert.deepEqual(update, { name: "Laptop", rating: 4.7 });
  assert.equal("description" in update, false);
});

test("search input is escaped before becoming a Mongo regex", () => {
  assert.equal(escapeRegex("Phone (Pro)+"), "Phone \\(Pro\\)\\+");
});

test("cart responses use one stable top-level shape", () => {
  const cart = formatCart({
    totalPrice: 200,
    items: [{
      productId: {
        _id: "product-1",
        name: "Mouse",
        category: "Accessories",
        image: "mouse.png",
        price: 100,
      },
      quantity: 2,
      price: 200,
    }],
  });

  assert.deepEqual(cart, {
    items: [{
      productId: "product-1",
      quantity: 2,
      price: 100,
      name: "Mouse",
      category: "Accessories",
      image: "mouse.png",
    }],
    totalPrice: 200,
  });
});

test("named product routes are registered before the dynamic id route", () => {
  const paths = productRoutes.stack
    .filter((layer) => layer.route)
    .map((layer) => layer.route.path);

  assert.ok(paths.indexOf("/findByName") < paths.indexOf("/:id"));
  assert.ok(paths.indexOf("/category") < paths.indexOf("/:id"));
});
