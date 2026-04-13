"use client"

import dynamic from "next/dynamic"
import { LeaveType } from "./leave-timeline"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

const PdfExportClient = dynamic(
  () => import("./pdf-export-client").then((mod) => mod.PdfExportClient),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" disabled className="gap-2">
        <Download className="h-4 w-4" />
        Export PDF
      </Button>
    ),
  }
)

interface PdfExportProps {
  dueDate: Date
  leaveType: LeaveType
  checkedItems: Set<string>
  iconOnly?: boolean
}

export function PdfExport({ dueDate, leaveType, checkedItems, iconOnly = false }: PdfExportProps) {
  return (
    <PdfExportClient
      dueDate={dueDate}
      leaveType={leaveType}
      checkedItems={checkedItems}
      iconOnly={iconOnly}
    />
  )
}
