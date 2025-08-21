import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const files = await db.collection("files").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(files)
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get form data
    const customerName = formData.get("customerName") as string
    const customerEmail = formData.get("customerEmail") as string
    const printType = formData.get("printType") as string
    const quantity = Number.parseInt(formData.get("quantity") as string)
    const paperSize = formData.get("paperSize") as string

    // Validate required fields
    if (!customerName || !customerEmail || !printType || !quantity || !paperSize) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Convert file to base64 for storage (in production, use cloud storage)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64File = buffer.toString("base64")

    const { db } = await connectToDatabase()

    const fileDoc = {
      customerName,
      customerEmail,
      fileName: file.name,
      fileType: file.type,
      printType,
      quantity,
      paperSize,
      fileData: base64File,
      fileUrl: `data:${file.type};base64,${base64File}`,
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection("files").insertOne(fileDoc)

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
