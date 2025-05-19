'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { useQRCode } from '@/hooks/use-qrcode'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

interface QRCode {
  id: string
  code: string
  validUntil: string
  location?: string
  isUsed: boolean
  createdAt: string
  updatedAt: string
}

export default function QRCodePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null)
  const [qrCodeImage, setQRCodeImage] = useState<string | null>(null)
  const [validUntil, setValidUntil] = useState('')
  const [location, setLocation] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const { qrCodes, loading, generateQRCode, toggleQRCodeStatus, generateQRCodeImage } = useQRCode()

  const handleGenerateQRCode = async () => {
    try {
      // Reset validation error
      setValidationError(null)

      // Validate that validUntil is in the future
      const validUntilDate = new Date(validUntil)
      const now = new Date()

      if (isNaN(validUntilDate.getTime())) {
        setValidationError('Invalid date format')
        return
      }

      if (validUntilDate <= now) {
        setValidationError('QR code expiration date must be in the future')
        return
      }

      const newQRCode = await generateQRCode(validUntil, location)
      toast.success('QR Code generated successfully')
      setIsDialogOpen(false)
      setValidUntil('')
      setLocation('')
      setValidationError(null)
    } catch (error) {
      toast.error('Failed to generate QR code')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleQRCodeStatus(id)
      toast.success('QR Code status updated successfully')
    } catch (error) {
      toast.error('Failed to update QR code status')
    }
  }

  const handlePreviewQRCode = async (qrCode: QRCode) => {
    try {
      const imageUrl = await generateQRCodeImage(qrCode.code)
      setQRCodeImage(imageUrl)
      setSelectedQRCode(qrCode)
      setIsPreviewOpen(true)
    } catch (error) {
      toast.error('Failed to generate QR code image')
    }
  }

  const handleDownloadQRCode = async () => {
    if (!qrCodeImage || !selectedQRCode) return

    try {
      // Tạo link tải xuống
      const link = document.createElement('a')
      link.href = qrCodeImage
      link.download = `qrcode-${selectedQRCode.code}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('QR Code downloaded successfully')
    } catch (error) {
      toast.error('Failed to download QR code')
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">QR Code Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Generate New QR Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New QR Code</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location"
                />
              </div>

              {validationError && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {validationError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setValidationError(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleGenerateQRCode} disabled={loading}>
                Generate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Codes List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No QR codes found
                  </TableCell>
                </TableRow>
              ) : (
                qrCodes.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell>{qr.code}</TableCell>
                    <TableCell>{qr.location || '-'}</TableCell>
                    <TableCell>
                      {qr.validUntil ? new Date(qr.validUntil).toLocaleString() : 'Invalid date'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          !qr.isUsed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {qr.isUsed ? 'Used' : 'Active'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(qr.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePreviewQRCode(qr)}>
                          Preview
                        </Button>
                        <Button
                          variant={qr.isUsed ? 'outline' : 'destructive'}
                          size="sm"
                          onClick={() => handleToggleStatus(qr.id)}
                        >
                          {qr.isUsed ? 'Activate' : 'Deactivate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* QR Code Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code Preview</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeImage && (
              <div className="relative w-[300px] h-[300px]">
                <Image src={qrCodeImage} alt="QR Code" fill className="object-contain" />
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
              <Button onClick={handleDownloadQRCode}>Download</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
