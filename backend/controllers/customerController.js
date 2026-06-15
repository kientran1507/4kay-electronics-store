const Customer = require("../models/customerModel");
const jwt = require("jsonwebtoken");

const toPublicCustomer = (customer) => ({
  _id: customer._id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone || "",
  address: customer.address || "",
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt,
});

exports.registerCustomer = async (req, res) => {
  const { name, email, password, phone, address } = req.body || {};

  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return res.status(400).json({
      message: "Name, email, and a password of at least 8 characters are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    if (await Customer.findOne({ email: normalizedEmail })) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim(),
      address: address?.trim(),
    });

    return res.status(201).json({
      message: "Registration successful.",
      user: toPublicCustomer(customer),
    });
  } catch (error) {
    console.error("Customer registration failed:", error.message);
    return res.status(500).json({ message: "Could not register customer." });
  }
};

exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const customer = await Customer.findOne({ email: email.trim().toLowerCase() });
    if (!customer || !(await customer.matchPassword(password))) {
      return res.status(400).json({ message: "Email or password is incorrect." });
    }

    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: toPublicCustomer(customer),
    });
  } catch (error) {
    console.error("Customer login failed:", error.message);
    return res.status(500).json({ message: "Could not sign in." });
  }
};

exports.updateCustomer = async (req, res) => {
  const { name, phone, address } = req.body || {};

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer does not exist." });
    }

    return res.status(200).json({
      message: "Customer profile updated.",
      customer: toPublicCustomer(updatedCustomer),
    });
  } catch (error) {
    console.error("Customer update failed:", error.message);
    return res.status(500).json({ message: "Could not update customer." });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    if (req.authRole !== "admin" && req.user.id.toString() !== req.params.id) {
      return res.status(403).json({ message: "You can only view your own profile." });
    }

    const customer = await Customer.findById(req.params.id).select("-password");
    if (!customer) {
      return res.status(404).json({ message: "Customer does not exist." });
    }
    return res.status(200).json(toPublicCustomer(customer));
  } catch (error) {
    console.error("Customer lookup failed:", error.message);
    return res.status(500).json({ message: "Could not load customer." });
  }
};

exports.getAllCustomers = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  try {
    const [customers, totalCustomers] = await Promise.all([
      Customer.find().select("-password").skip(skip).limit(limit),
      Customer.countDocuments(),
    ]);

    return res.status(200).json({
      message: "Customer list.",
      customers: customers.map(toPublicCustomer),
      currentPage: page,
      totalPages: Math.ceil(totalCustomers / limit),
      totalCustomers,
    });
  } catch (error) {
    console.error("Customer list failed:", error.message);
    return res.status(500).json({ message: "Could not load customers." });
  }
};

exports.toPublicCustomer = toPublicCustomer;
