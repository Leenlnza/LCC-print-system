import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const slip = formData.get("slip") as File
    const name = formData.get("name") as string
    const major = formData.get("major") as string
    const copies = Number(formData.get("copies") as string)
    const color = formData.get("color") as string
    const time = formData.get("time") as string

    if (!file || !slip) {
      return NextResponse.json({ error: "Missing files" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const fileData = Buffer.from(await file.arrayBuffer()).toString("base64")
    const slipData = Buffer.from(await slip.arrayBuffer()).toString("base64")

    const order = {
      name,
      major,
      time,
      color,
      copies,
      price: color === "color" ? 10 : 1,
      totalPrice: copies * (color === "color" ? 10 : 1),
      fileName: file.name,
      fileType: file.type,
      fileData: `data:${file.type};base64,${fileData}`,
      slipName: slip.name,
      slipType: slip.type,
      slipData: `data:${slip.type};base64,${slipData}`,
      createdAt: new Date().toISOString(),
    }

    await db.collection("orders").insertOne(order)

    return NextResponse.json({ message: "Order created", order }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
