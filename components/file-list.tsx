"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search, FileText, Download, Trash2, User, Mail, Printer } from "lucide-react"

interface PrintFile {
  _id: string
  customerName: string
  customerEmail: string
  fileName: string
  fileType: string
  printType: string
  quantity: number
  paperSize: string
  fileUrl: string
  createdAt: string
}

export default function FileList() {
  const [files, setFiles] = useState<PrintFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files")
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลไฟล์ได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบไฟล์นี้?")) return

    try {
      const response = await fetch(`/api/files/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFiles(files.filter((file) => file._id !== id))
        toast({
          title: "สำเร็จ!",
          description: "ลบไฟล์เรียบร้อยแล้ว",
        })
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบไฟล์ได้",
        variant: "destructive",
      })
    }
  }

  const filteredFiles = files.filter(
    (file) =>
      file.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getPrintTypeLabel = (type: string) => {
    switch (type) {
      case "color":
        return "สี"
      case "blackwhite":
        return "ขาวดำ"
      case "photo":
        return "รูปภาพ"
      default:
        return type
    }
  }

  const getPrintTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "color":
        return "default"
      case "blackwhite":
        return "secondary"
      case "photo":
        return "outline"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">กำลังโหลดข้อมูล...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="ค้นหาไฟล์..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{searchTerm ? "ไม่พบไฟล์ที่ค้นหา" : "ยังไม่มีไฟล์ในระบบ"}</div>
      ) : (
        <div className="grid gap-4">
          {filteredFiles.map((file) => (
            <Card key={file._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{file.fileName}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getPrintTypeBadgeVariant(file.printType)}>
                          {getPrintTypeLabel(file.printType)}
                        </Badge>
                        <Badge variant="outline">{file.paperSize}</Badge>
                        <Badge variant="secondary">{file.quantity} ชิ้น</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(file.fileUrl, "_blank")}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteFile(file._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{file.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{file.customerEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Printer className="w-4 h-4 text-gray-400" />
                    <span>
                      {getPrintTypeLabel(file.printType)} - {file.paperSize}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">จำนวน:</span>
                    <span>{file.quantity} ชิ้น</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  อัปโหลดเมื่อ: {new Date(file.createdAt).toLocaleDateString("th-TH")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
