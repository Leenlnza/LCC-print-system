import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting POST request processing...")

    const formData = await request.formData()
    console.log("FormData received")

    const file = formData.get("file") as File
    const slip = formData.get("slip") as File
    const name = formData.get("name") as string
    const major = formData.get("major") as string
    const copies = Number(formData.get("copies") as string) || 1

    // แก้ตรงนี้ให้ pack มีค่า default = 1
    const packValue = formData.get("pack")
    const pack = packValue ? Number(packValue) : 1
    console.log("Pack value:", pack, typeof pack)

    const color = formData.get("color") as string
    const time = formData.get("time") as string

    console.log("Form data extracted:", { name, major, copies, pack, color, time })

    // Add validation
    if (!file || !slip) {
      console.log("Missing files error")
      return NextResponse.json({ error: "Missing files" }, { status: 400 })
    }

    if (pack <= 0) {
      console.log("Invalid pack error")
      return NextResponse.json({ error: "Pack must be a positive number" }, { status: 400 })
    }

    console.log("Connecting to database...")
    const { db } = await connectToDatabase()
    console.log("Database connected successfully")

    console.log("Processing files...")
    const fileData = Buffer.from(await file.arrayBuffer()).toString("base64")
    const slipData = Buffer.from(await slip.arrayBuffer()).toString("base64")
    console.log("Files processed successfully")

    const order = {
      name,
      major,
      time,
      color,
      copies,
      pack, // ส่งเป็น number แน่นอน
      price: color === "color" ? 10 : 1,
      totalPrice: (copies * pack) * (color === "color" ? 10 : 1),
      fileName: file.name,
      fileType: file.type,
      fileData: `data:${file.type};base64,${fileData}`,
      slipName: slip.name,
      slipType: slip.type,
      slipData: `data:${slip.type};base64,${slipData}`,
      createdAt: new Date().toISOString(),
    }

    console.log("Inserting order into database...")
    await db.collection("orders").insertOne(order)
    console.log("Order inserted successfully")

    return NextResponse.json({ message: "Order created", order }, { status: 201 })
  } catch (error) {
    console.error("Detailed error:", error)
    return NextResponse.json({ 
      error: "Failed to create order", 
    }, { status: 500 })
  }
}
