const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { adminProtect, protect } = require("../middleware/authMiddleware");

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("customer middleware rejects missing bearer token", async () => {
  const res = createResponse();
  let nextCalled = false;

  await protect({ headers: {} }, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /token/i);
  assert.equal(nextCalled, false);
});

test("customer middleware rejects malformed bearer token", async () => {
  const res = createResponse();

  await protect({ headers: { authorization: "Bearer not-a-token" } }, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /invalid|expired/i);
});

test("admin middleware rejects a valid non-admin token before database lookup", async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
  const token = jwt.sign({ id: "customer-id", role: "customer" }, process.env.JWT_SECRET);
  const res = createResponse();

  await adminProtect({ headers: { authorization: `Bearer ${token}` } }, res, () => {});

  assert.equal(res.statusCode, 403);
  assert.match(res.body.message, /admin/i);
});
