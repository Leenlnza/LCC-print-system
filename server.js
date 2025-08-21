const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Admin credentials (ในการใช้งานจริงควรเข้ารหัส)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

// Order Schema
const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  major: { type: String, required: true },
  time: { type: String, required: true },
  color: { type: String, required: true },
  copies: { type: Number, required: true },
  price: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  fileData: { type: String, required: true },
  fileType: { type: String, required: true },
  fileName: { type: String, required: true },
  slipData: { type: String, required: true }, // เพิ่มฟิลด์สลิป
  slipType: { type: String, required: true }, // เพิ่มประเภทไฟล์สลิป
  slipName: { type: String, required: true }, // เพิ่มชื่อไฟล์สลิป
  createdAt: { type: Date, default: Date.now },
})

const Order = mongoose.model("Order", orderSchema)

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(express.static(path.join(__dirname, "public")))

// Configure Multer
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Middleware to check admin authentication
const checkAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ error: "Authentication required" })
  }

  const base64Credentials = authHeader.split(" ")[1]
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii")
  const [username, password] = credentials.split(":")

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    next()
  } else {
    res.status(401).json({ error: "Invalid credentials" })
  }
}

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Admin login route
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      token: Buffer.from(`${username}:${password}`).toString("base64"),
    })
  } else {
    res.status(401).json({
      success: false,
      message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
    })
  }
})

// Get all orders (for admin) - requires authentication
app.get("/api/orders", checkAdminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({ error: error.message })
  }
})

// Create new order (public) - แก้ไขให้รับไฟล์สลิปด้วย
app.post(
  "/api/orders",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "slip", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, major, time, color, copies } = req.body
      const file = req.files["file"][0]
      const slip = req.files["slip"][0]

      if (!file) {
        return res.status(400).json({ error: "ไม่พบไฟล์ที่อัปโหลด" })
      }

      if (!slip) {
        return res.status(400).json({ error: "ไม่พบสลิปการโอนเงิน" })
      }

      // Convert files to base64
      const fileData = file.buffer.toString("base64")
      const slipData = slip.buffer.toString("base64")

      const pricePerCopy = color === "color" ? 10 : 1
      const totalPrice = Number.parseInt(copies) * pricePerCopy

      const order = new Order({
        name,
        major,
        time,
        color,
        copies: Number.parseInt(copies),
        price: pricePerCopy,
        totalPrice,
        fileData: `data:${file.mimetype};base64,${fileData}`,
        fileType: file.mimetype,
        fileName: file.originalname,
        slipData: `data:${slip.mimetype};base64,${slipData}`,
        slipType: slip.mimetype,
        slipName: slip.originalname,
      })

      await order.save()
      console.log(`✅ New order created: ${name} - ${file.originalname} (with payment slip)`)
      res.status(201).json({ message: "สั่งปริ้นเรียบร้อยแล้ว", order: order })
    } catch (error) {
      console.error("Error creating order:", error)
      res.status(500).json({ error: error.message })
    }
  },
)

// Delete single order - requires authentication
app.delete("/api/orders/:id", checkAdminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) {
      return res.status(404).json({ error: "ไม่พบรายการที่ต้องการลบ" })
    }
    console.log(`🗑️ Order deleted: ${order.name}`)
    res.json({ message: "ลบรายการเรียบร้อยแล้ว" })
  } catch (error) {
    console.error("Error deleting order:", error)
    res.status(500).json({ error: error.message })
  }
})

// Clear all orders - requires authentication
app.delete("/api/orders", checkAdminAuth, async (req, res) => {
  try {
    const result = await Order.deleteMany({})
    console.log(`🗑️ All orders cleared: ${result.deletedCount} orders deleted`)
    res.json({ message: "ลบรายการทั้งหมดเรียบร้อยแล้ว" })
  } catch (error) {
    console.error("Error clearing orders:", error)
    res.status(500).json({ error: error.message })
  }
})

// Update order status - requires authentication
app.patch("/api/orders/:id", checkAdminAuth, async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!order) {
      return res.status(404).json({ error: "ไม่พบรายการ" })
    }
    res.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`👤 User page: http://localhost:${PORT}/user.html`)
  console.log(`👨‍💼 Admin page: http://localhost:${PORT}/admin.html`)
  console.log(`🔐 Admin credentials: ${ADMIN_USERNAME}/${ADMIN_PASSWORD}`)
})
