const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lineId: {            // <-- เพิ่ม Line ID
    type: String,
    trim: true,
    default: "",
  },
  major: {
    type: String,
    required: true,
    trim: true,
  },
  time: {
    type: String,
    required: true,
    enum: ["11:15", "12:15"],
  },
  color: {
    type: String,
    required: true,
    enum: ["color", "bw"],
  },
  copies: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  pack: { 
  type: Number, 
  required: true, 
  min: 1, 
  default: 1,
  set: v => Number(v)  // แปลงเป็น number ทุกครั้ง
},
  price: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  note: {              // <-- เพิ่มหมายเหตุ
    type: String,
    trim: true,
    default: "",
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
