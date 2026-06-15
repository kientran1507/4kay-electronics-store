const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");

const toPublicAdmin = (admin) => ({
  _id: admin._id,
  name: admin.name,
  email: admin.email,
  phone: admin.phone || "",
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
});

exports.registerAdmin = async (req, res) => {
  const { name, email, password, phone } = req.body || {};
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return res.status(400).json({
      message: "Name, email, and a password of at least 8 characters are required.",
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (await Admin.findOne({ email: normalizedEmail })) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const admin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim(),
    });

    return res.status(201).json({
      message: "Admin registration successful.",
      admin: toPublicAdmin(admin),
    });
  } catch (error) {
    console.error("Admin registration failed:", error.message);
    return res.status(500).json({ message: "Could not register admin." });
  }
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(400).json({ message: "Email or password is incorrect." });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "3h" },
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: toPublicAdmin(admin),
    });
  } catch (error) {
    console.error("Admin login failed:", error.message);
    return res.status(500).json({ message: "Could not sign in." });
  }
};

exports.updateAdmin = async (req, res) => {
  const { name, phone } = req.body || {};
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true },
    ).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin does not exist." });
    }

    return res.status(200).json({
      message: "Admin profile updated.",
      admin: toPublicAdmin(admin),
    });
  } catch (error) {
    console.error("Admin update failed:", error.message);
    return res.status(500).json({ message: "Could not update admin." });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin does not exist." });
    }
    return res.status(200).json(toPublicAdmin(admin));
  } catch (error) {
    console.error("Admin lookup failed:", error.message);
    return res.status(500).json({ message: "Could not load admin." });
  }
};

exports.getAllAdmins = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  try {
    const [admins, totalAdmins] = await Promise.all([
      Admin.find().select("-password").skip(skip).limit(limit),
      Admin.countDocuments(),
    ]);

    return res.status(200).json({
      message: "Admin list.",
      admins: admins.map(toPublicAdmin),
      currentPage: page,
      totalPages: Math.ceil(totalAdmins / limit),
      totalAdmins,
    });
  } catch (error) {
    console.error("Admin list failed:", error.message);
    return res.status(500).json({ message: "Could not load admins." });
  }
};

exports.toPublicAdmin = toPublicAdmin;
