import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const members = await db.collection("members").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, address, memberType, company } = body

    // Validate required fields
    if (!name || !email || !phone || !address || !memberType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if email already exists
    const existingMember = await db.collection("members").findOne({ email })
    if (existingMember) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const member = {
      name,
      email,
      phone,
      address,
      memberType,
      company: company || null,
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection("members").insertOne(member)

    return NextResponse.json(
      {
        message: "Member created successfully",
        id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating member:", error)
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 })
  }
}
