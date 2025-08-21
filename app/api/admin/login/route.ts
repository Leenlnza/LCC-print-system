import { NextRequest, NextResponse } from "next/server"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return NextResponse.json({ 
      success: true, 
      token: Buffer.from(`${username}:${password}`).toString("base64") 
    })
  } else {
    return NextResponse.json(
      { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 }
    )
  }
}