"use client"

import * as React from "react"
import { format, addWeeks } from "date-fns"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LeaveType } from "./leave-timeline"

const LEAVE_CONFIG = {
  standard: { totalWeeks: 15, paidWeeks: 15, label: "Standard (15 weeks)" },
  extended: { totalWeeks: 26, paidWeeks: 15, label: "Extended (6 months)" },
  "full-year": { totalWeeks: 35, paidWeeks: 15, label: "Full Year (8 months)" },
}

const checklistData = [
  { id: "crib", label: "Crib or bassinet", category: "Nursery" },
  { id: "mattress", label: "Crib mattress", category: "Nursery" },
  { id: "sheets", label: "Fitted sheets (2-3)", category: "Nursery" },
  { id: "blankets", label: "Swaddle blankets", category: "Nursery" },
  { id: "monitor", label: "Baby monitor", category: "Nursery" },
  { id: "onesies", label: "Onesies (5-7)", category: "Clothing" },
  { id: "sleepsuits", label: "Sleep suits (3-5)", category: "Clothing" },
  { id: "socks", label: "Socks and booties", category: "Clothing" },
  { id: "hats", label: "Hats for warmth", category: "Clothing" },
  { id: "bottles", label: "Bottles and nipples", category: "Feeding" },
  { id: "pump", label: "Breast pump", category: "Feeding" },
  { id: "nursing", label: "Nursing pillows", category: "Feeding" },
  { id: "bibs", label: "Burp cloths and bibs", category: "Feeding" },
  { id: "carseat", label: "Car seat", category: "Travel" },
  { id: "stroller", label: "Stroller", category: "Travel" },
  { id: "carrier", label: "Baby carrier/wrap", category: "Travel" },
  { id: "diaperbag", label: "Diaper bag", category: "Travel" },
  { id: "diapers", label: "Diapers (newborn size)", category: "Essentials" },
  { id: "wipes", label: "Baby wipes", category: "Essentials" },
  { id: "cream", label: "Diaper cream", category: "Essentials" },
  { id: "thermometer", label: "Baby thermometer", category: "Essentials" },
  { id: "bath", label: "Baby bathtub", category: "Essentials" },
]

interface PdfExportClientProps {
  dueDate: Date
  leaveType: LeaveType
  checkedItems: Set<string>
  iconOnly?: boolean
}

export function PdfExportClient({ dueDate, leaveType, checkedItems, iconOnly = false }: PdfExportClientProps) {
  const [isExporting, setIsExporting] = React.useState(false)
  const [exportCheckedItems, setExportCheckedItems] = React.useState<Set<string>>(checkedItems)
  const exportRef = React.useRef<HTMLDivElement>(null)

  const categories = React.useMemo(
    () => Array.from(new Set(checklistData.map((item) => item.category))),
    []
  )

  const config = LEAVE_CONFIG[leaveType]
  const leaveStartDate = addWeeks(dueDate, -1)
  const leaveEndDate = addWeeks(leaveStartDate, config.totalWeeks)
  const completedCount = exportCheckedItems.size
  const totalCount = checklistData.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const saved = localStorage.getItem("shir-guy-baby-checklist")
      let latestCheckedItems = checkedItems
      if (saved) {
        try {
          latestCheckedItems = new Set<string>(JSON.parse(saved))
        } catch {
          latestCheckedItems = checkedItems
        }
      }

      setExportCheckedItems(latestCheckedItems)
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

      const { default: html2canvas } = await import("html2canvas")
      const { default: jsPDF } = await import("jspdf")

      if (!exportRef.current) throw new Error("Export content is not ready")

      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save("shir-guy-baby-plan.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleExport}
        disabled={isExporting}
        variant="outline"
        size={iconOnly ? "icon" : "default"}
        className={iconOnly
          ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
          : "gap-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
        }
        aria-label="Export PDF"
        title="Export PDF"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {!iconOnly && "Generating..."}
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            {!iconOnly && "Export PDF"}
          </>
        )}
      </Button>

      <div ref={exportRef} className="pointer-events-none fixed -left-[9999px] top-0 w-[900px] bg-white p-8 text-black">
        <h1 className="text-3xl font-bold text-[#c26c59]">Shir & Guy&apos;s Baby Plan</h1>
        <p className="mt-1 text-sm text-gray-600">Generated on {format(new Date(), "MMMM d, yyyy")}</p>

        <section className="mt-8 rounded-xl border border-[#f2ddd7] bg-[#fcf7f5] p-5">
          <h2 className="text-xl font-semibold text-[#c26c59]">Leave Timeline</h2>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-white p-3">
              <p className="text-xs text-gray-500">Due Date</p>
              <p className="font-semibold">{format(dueDate, "MMM d, yyyy")}</p>
            </div>
            <div className="rounded-lg bg-white p-3">
              <p className="text-xs text-gray-500">Start</p>
              <p className="font-semibold">{format(leaveStartDate, "MMM d, yyyy")}</p>
            </div>
            <div className="rounded-lg bg-white p-3">
              <p className="text-xs text-gray-500">Return</p>
              <p className="font-semibold">{format(leaveEndDate, "MMM d, yyyy")}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-700">
            {config.label} - {config.paidWeeks} weeks paid
            {config.totalWeeks > config.paidWeeks ? ` + ${config.totalWeeks - config.paidWeeks} weeks unpaid` : ""}
          </p>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#c26c59]">Baby Checklist</h2>
            <p className="text-sm font-medium text-gray-700">
              {completedCount}/{totalCount} ({progressPercent}%)
            </p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-[#c26c59]" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="mt-5 space-y-4">
            {categories.map((category) => {
              const items = checklistData.filter((item) => item.category === category)
              const categoryCompleted = items.filter((item) => exportCheckedItems.has(item.id)).length
              return (
                <div key={category} className="rounded-lg border border-gray-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold">{category}</p>
                    <p className="text-xs text-gray-500">{categoryCompleted}/{items.length}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {items.map((item) => {
                      const isChecked = exportCheckedItems.has(item.id)
                      return (
                        <p key={item.id} className={`text-sm ${isChecked ? "text-gray-400 line-through" : "text-gray-800"}`}>
                          {isChecked ? "x" : "o"} {item.label}
                        </p>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
