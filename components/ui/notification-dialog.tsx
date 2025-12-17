"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'

type NotificationType = "success" | "error" | "warning" | "info"

interface NotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  type?: NotificationType
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
}

export function NotificationDialog({
  open,
  onOpenChange,
  title,
  description,
  type = "info",
  showCancel = false,
  confirmText = "OK",
  cancelText = "Cancelar",
  onConfirm,
}: NotificationDialogProps) {
  const icons = {
    success: <CheckCircle2 className="h-6 w-6 text-green-600" />,
    error: <XCircle className="h-6 w-6 text-destructive" />,
    warning: <AlertCircle className="h-6 w-6 text-orange-500" />,
    info: <Info className="h-6 w-6 text-blue-500" />,
  }

  const bgColors = {
    success: "bg-green-50",
    error: "bg-red-50",
    warning: "bg-orange-50",
    info: "bg-blue-50",
  }

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm()
    }
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${bgColors[type]}`}>
              {icons[type]}
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base whitespace-pre-wrap mt-4">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancel && (
            <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          )}
          <AlertDialogAction onClick={handleConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
