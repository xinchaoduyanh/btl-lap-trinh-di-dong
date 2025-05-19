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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [qrCodeToDelete, setQrCodeToDelete] = useState<string | null>(null)
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null)
  const [qrCodeImage, setQRCodeImage] = useState<string | null>(null)
  const [validUntil, setValidUntil] = useState('')
  const [location, setLocation] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const {
    qrCodes,
    loading,
    generateQRCode,
    toggleQRCodeStatus,
    generateQRCodeImage,
    deleteQRCode,
  } = useQRCode()

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

  const handleDeleteQRCode = (id: string) => {
    setQrCodeToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteQRCode = async () => {
    if (!qrCodeToDelete) return

    try {
      await deleteQRCode(qrCodeToDelete)
      toast.success('QR code deleted successfully')
      setQrCodeToDelete(null)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast.error('Failed to delete QR code')
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
                <TableHead className="w-[120px]">Code</TableHead>
                <TableHead className="w-[150px]">Location</TableHead>
                <TableHead className="w-[180px]">Valid Until</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[180px]">Created At</TableHead>
                <TableHead className="w-[250px]">Actions</TableHead>
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
                    <TableCell className="w-[120px]">{qr.code}</TableCell>
                    <TableCell className="w-[150px]">{qr.location || '-'}</TableCell>
                    <TableCell className="w-[180px]">
                      {qr.validUntil ? new Date(qr.validUntil).toLocaleString() : 'Invalid date'}
                    </TableCell>
                    <TableCell className="w-[100px]">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          !qr.isUsed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {qr.isUsed ? 'Used' : 'Active'}
                      </span>
                    </TableCell>
                    <TableCell className="w-[180px]">
                      {new Date(qr.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="w-[250px]">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePreviewQRCode(qr)}>
                          Preview
                        </Button>
                        <Button
                          variant={qr.isUsed ? 'outline' : 'destructive'}
                          size="sm"
                          onClick={() => handleToggleStatus(qr.id)}
                        >
                          {qr.isUsed ? 'Enable' : 'Disable'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteQRCode(qr.id)}
                        >
                          Delete
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the QR code from the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQrCodeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteQRCode}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
