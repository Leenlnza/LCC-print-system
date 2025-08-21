"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, FileText, Printer } from "lucide-react"

export default function FileUpload() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    fileName: "",
    fileType: "",
    printType: "",
    quantity: "",
    paperSize: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast({
        title: "กรุณาเลือกไฟล์",
        description: "กรุณาเลือกไฟล์ที่ต้องการอัปโหลด",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("file", selectedFile)
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value)
      })

      const response = await fetch("/api/files", {
        method: "POST",
        body: formDataToSend,
      })

      if (response.ok) {
        toast({
          title: "สำเร็จ!",
          description: "อัปโหลดไฟล์เรียบร้อยแล้ว",
        })
        setFormData({
          customerName: "",
          customerEmail: "",
          fileName: "",
          fileType: "",
          printType: "",
          quantity: "",
          paperSize: "",
        })
        setSelectedFile(null)
        // Reset file input
        const fileInput = document.getElementById("file") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        throw new Error("Failed to upload file")
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFormData((prev) => ({ ...prev, fileName: file.name, fileType: file.type }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">ชื่อลูกค้า</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => handleChange("customerName", e.target.value)}
            placeholder="กรอกชื่อลูกค้า"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">อีเมลลูกค้า</Label>
          <Input
            id="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleChange("customerEmail", e.target.value)}
            placeholder="กรอกอีเมลลูกค้า"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          เลือกไฟล์
        </Label>
        <Input
          id="file"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          required
        />
        {selectedFile && (
          <p className="text-sm text-gray-600">
            ไฟล์ที่เลือก: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="printType" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            ประเภทการปริ้น
          </Label>
          <Select value={formData.printType} onValueChange={(value) => handleChange("printType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกประเภทการปริ้น" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="color">สี</SelectItem>
              <SelectItem value="blackwhite">ขาวดำ</SelectItem>
              <SelectItem value="photo">รูปภาพ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paperSize">ขนาดกระดาษ</Label>
          <Select value={formData.paperSize} onValueChange={(value) => handleChange("paperSize", value)}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกขนาดกระดาษ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="A3">A3</SelectItem>
              <SelectItem value="A5">A5</SelectItem>
              <SelectItem value="Letter">Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">จำนวน</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            placeholder="จำนวนที่ต้องการปริ้น"
            min="1"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            กำลังอัปโหลด...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            อัปโหลดไฟล์
          </>
        )}
      </Button>
    </form>
  )
}
