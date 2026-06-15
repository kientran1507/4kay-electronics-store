const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  findProducts,
  findProductsByCategory,
} = require("../controllers/productController");
const { adminProtect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", adminProtect, createProduct);
router.put("/update/:id", adminProtect, updateProduct);
router.delete("/delete/:id", adminProtect, deleteProduct);

router.get("/", getAllProducts);
router.get("/category", findProductsByCategory);
router.get("/findByName", findProducts);
router.get("/:id", getProductById);

module.exports = router;
