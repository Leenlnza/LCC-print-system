"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, Mail, Phone, MapPin } from "lucide-react"

export default function MemberForm() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    memberType: "",
    company: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "สำเร็จ!",
          description: "สมัครสมาชิกเรียบร้อยแล้ว",
        })
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          memberType: "",
          company: "",
        })
      } else {
        throw new Error("Failed to create member")
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            ชื่อ-นามสกุล
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="กรอกชื่อ-นามสกุล"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            อีเมล
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="กรอกอีเมล"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            เบอร์โทรศัพท์
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="กรอกเบอร์โทรศัพท์"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="memberType">ประเภทสมาชิก</Label>
          <Select value={formData.memberType} onValueChange={(value) => handleChange("memberType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกประเภทสมาชิก" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">บุคคลทั่วไป</SelectItem>
              <SelectItem value="business">ธุรกิจ</SelectItem>
              <SelectItem value="corporate">บริษัท</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">ชื่อบริษัท/ร้านค้า (ถ้ามี)</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => handleChange("company", e.target.value)}
          placeholder="กรอกชื่อบริษัทหรือร้านค้า"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          ที่อยู่
        </Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="กรอกที่อยู่"
          rows={3}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            กำลังสมัครสมาชิก...
          </>
        ) : (
          "สมัครสมาชิก"
        )}
      </Button>
    </form>
  )
}
