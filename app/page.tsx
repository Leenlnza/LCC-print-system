"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MemberForm from "@/components/member-form"
import FileUpload from "@/components/file-upload"
import MemberList from "@/components/member-list"
import FileList from "@/components/file-list"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("register")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ระบบจัดการสมาชิกและไฟล์ปริ้น</h1>
          <p className="text-gray-600">เชื่อมต่อกับ MongoDB Atlas สำหรับเก็บข้อมูลสมาชิกและไฟล์งานปริ้น</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="register">สมัครสมาชิก</TabsTrigger>
            <TabsTrigger value="upload">อัปโหลดไฟล์</TabsTrigger>
            <TabsTrigger value="members">รายชื่อสมาชิก</TabsTrigger>
            <TabsTrigger value="files">ไฟล์ทั้งหมด</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>สมัครสมาชิกใหม่</CardTitle>
                <CardDescription>กรอกข้อมูลเพื่อสมัครสมาชิกในระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <MemberForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>อัปโหลดไฟล์งานปริ้น</CardTitle>
                <CardDescription>อัปโหลดไฟล์ที่ต้องการปริ้น พร้อมระบุรายละเอียด</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>รายชื่อสมาชิก</CardTitle>
                <CardDescription>ดูรายชื่อสมาชิกทั้งหมดในระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <MemberList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>ไฟล์ทั้งหมด</CardTitle>
                <CardDescription>ดูไฟล์งานปริ้นทั้งหมดในระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <FileList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
