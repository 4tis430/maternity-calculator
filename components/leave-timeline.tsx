"use client"

import { format, addWeeks, isBefore, isAfter, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"
import { Baby, Calendar, Briefcase, Heart, Clock } from "lucide-react"

export type LeaveType = "standard" | "extended" | "full-year"

interface LeaveTimelineProps {
  dueDate: Date
  leaveType: LeaveType
  holidays?: PublicHoliday[]
  isLoadingHolidays?: boolean
}

interface TimelineItem {
  week: number
  startDate: Date
  endDate: Date
  label: string
  type: "pre-birth" | "paid" | "unpaid"
}

interface PublicHoliday {
  date: string
  localName: string
  name: string
}

const LEAVE_CONFIG = {
  standard: {
    totalWeeks: 15,
    paidWeeks: 15,
    label: "Standard (15 weeks)",
    description: "~3.5 months paid leave",
  },
  extended: {
    totalWeeks: 26,
    paidWeeks: 15,
    label: "Extended (6 months)",
    description: "15 weeks paid + 11 weeks unpaid",
  },
  "full-year": {
    totalWeeks: 35,
    paidWeeks: 15,
    label: "Full Year (8 months)",
    description: "15 weeks paid + 20 weeks unpaid",
  },
}

export function LeaveTimeline({ dueDate, leaveType, holidays = [], isLoadingHolidays = false }: LeaveTimelineProps) {
  const today = startOfDay(new Date())
  const config = LEAVE_CONFIG[leaveType]
  
  // Maternity leave starts exactly 1 week before due date
  const leaveStartDate = addWeeks(dueDate, -1)
  const leaveEndDate = addWeeks(leaveStartDate, config.totalWeeks)
  const paidEndDate = addWeeks(leaveStartDate, config.paidWeeks)

  // Generate timeline items
  const timelineItems: TimelineItem[] = []
  
  for (let i = 0; i < config.totalWeeks; i++) {
    const weekStart = addWeeks(leaveStartDate, i)
    const weekEnd = addWeeks(weekStart, 1)
    
    let type: TimelineItem["type"]
    if (i === 0) {
      type = "pre-birth"
    } else if (i < config.paidWeeks) {
      type = "paid"
    } else {
      type = "unpaid"
    }
    
    let label = `Week ${i + 1}`
    if (i === 0) label = "Leave Begins"
    if (i === 1) label = "Due Date Week"
    if (i === config.paidWeeks - 1 && leaveType !== "standard") label = "Paid Leave Ends"
    if (i === config.totalWeeks - 1) label = "Return to Work"
    
    timelineItems.push({
      week: i + 1,
      startDate: weekStart,
      endDate: weekEnd,
      label,
      type,
    })
  }

  const getWeekStatus = (item: TimelineItem) => {
    if (isBefore(item.endDate, today)) return "completed"
    if (isBefore(today, item.startDate)) return "upcoming"
    return "current"
  }

  // Group weeks for compact view when many weeks
  const shouldGroupWeeks = config.totalWeeks > 20
  const groupedItems = shouldGroupWeeks 
    ? groupTimelineItems(timelineItems) 
    : timelineItems.map(item => ({ ...item, isGroup: false, groupEnd: item.week }))

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary/40" />
          <span className="text-muted-foreground">Pre-birth (1 week)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Paid leave</span>
        </div>
        {leaveType !== "standard" && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted-foreground/40" />
            <span className="text-muted-foreground">Unpaid leave</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-accent" />
          <span className="text-muted-foreground">Current</span>
        </div>
      </div>

      {/* Duration info */}
      <div className="rounded-lg border bg-secondary/50 p-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">{config.label}:</span>
          <span className="text-muted-foreground">{config.description}</span>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />

        <div className="space-y-3">
          {groupedItems.map((item, index) => {
            const status = getWeekStatus(item)
            const isLeft = index % 2 === 0
            const isDueDateWeek = item.week === 2 || (item.isGroup && item.week <= 2 && item.groupEnd >= 2)
            const isPaidEndWeek = item.week === config.paidWeeks || (item.isGroup && item.week <= config.paidWeeks && item.groupEnd >= config.paidWeeks)

            return (
              <div
                key={item.week}
                className={cn(
                  "relative flex items-center",
                  "md:justify-center"
                )}
              >
                {/* Mobile layout */}
                <div className="flex items-start gap-4 pl-10 md:hidden">
                  <div
                    className={cn(
                      "absolute left-2.5 h-3 w-3 rounded-full border-2 border-background",
                      status === "completed" && item.type === "pre-birth" && "bg-primary/40",
                      status === "completed" && item.type === "paid" && "bg-primary",
                      status === "completed" && item.type === "unpaid" && "bg-muted-foreground/40",
                      status === "current" && "bg-accent ring-4 ring-accent/20",
                      status === "upcoming" && item.type === "unpaid" && "bg-muted-foreground/20",
                      status === "upcoming" && item.type !== "unpaid" && "bg-muted"
                    )}
                  />
                  <div
                    className={cn(
                      "flex-1 rounded-lg border bg-card p-3 shadow-sm transition-all",
                      status === "current" && "border-accent ring-2 ring-accent/20",
                      item.type === "unpaid" && "border-dashed"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-card-foreground">
                        {item.isGroup ? `Weeks ${item.week}-${item.groupEnd}` : item.label}
                      </span>
                      {isDueDateWeek && <Baby className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(item.startDate, "MMM d")} - {format(item.isGroup ? addWeeks(item.startDate, item.groupEnd - item.week) : item.endDate, "MMM d, yyyy")}
                    </p>
                    {item.type === "unpaid" && (
                      <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Unpaid
                      </span>
                    )}
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden w-full md:flex md:items-center md:justify-center">
                  <div className={cn("w-5/12", isLeft ? "pr-8 text-right" : "order-3 pl-8")}>
                    <div
                      className={cn(
                        "inline-block rounded-lg border bg-card p-4 shadow-sm transition-all",
                        status === "current" && "border-accent ring-2 ring-accent/20",
                        item.type === "unpaid" && "border-dashed"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {!isLeft && isDueDateWeek && <Baby className="h-4 w-4 text-primary" />}
                        <span className="font-medium text-card-foreground">
                          {item.isGroup ? `Weeks ${item.week}-${item.groupEnd}` : item.label}
                        </span>
                        {isLeft && isDueDateWeek && <Baby className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(item.startDate, "MMM d")} - {format(item.isGroup ? addWeeks(item.startDate, item.groupEnd - item.week) : item.endDate, "MMM d, yyyy")}
                      </p>
                      {item.type === "unpaid" && (
                        <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Unpaid
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "relative z-10 order-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-background",
                      status === "completed" && item.type === "pre-birth" && "bg-primary/40",
                      status === "completed" && item.type === "paid" && "bg-primary",
                      status === "completed" && item.type === "unpaid" && "bg-muted-foreground/40",
                      status === "current" && "bg-accent ring-4 ring-accent/20",
                      status === "upcoming" && item.type === "unpaid" && "bg-muted-foreground/20",
                      status === "upcoming" && item.type !== "unpaid" && "bg-muted"
                    )}
                  >
                    <span className="text-xs font-bold text-card-foreground">
                      {item.isGroup ? `${item.week}+` : item.week}
                    </span>
                  </div>

                  <div className={cn("w-5/12", !isLeft ? "pr-8 text-right order-1" : "pl-8")} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Leave Starts</p>
              <p className="font-semibold text-card-foreground">{format(leaveStartDate, "MMM d, yyyy")}</p>
              <p className="text-xs text-muted-foreground">1 week before due date</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
              <Baby className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-semibold text-card-foreground">{format(dueDate, "MMM d, yyyy")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Briefcase className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Return to Work</p>
              <p className="font-semibold text-card-foreground">{format(leaveEndDate, "MMM d, yyyy")}</p>
              <p className="text-xs text-muted-foreground">After {config.totalWeeks} weeks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional info for extended leave */}
      {leaveType !== "standard" && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Heart className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-card-foreground">Extended Leave Note</p>
              <p className="text-sm text-muted-foreground">
                The first 15 weeks are paid by Bituach Leumi. The remaining {config.totalWeeks - 15} weeks 
                are unpaid leave that you may be entitled to take. Check with your employer about their 
                specific policies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Holiday planning note */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="font-medium text-card-foreground">
          Pay attention to upcoming holidays during your leave.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Holidays inside your first 15 paid weeks can affect planning, childcare help, and return-to-work timing.
        </p>

        <div className="mt-3">
          {isLoadingHolidays ? (
            <p className="text-sm text-muted-foreground">Checking Israeli holidays...</p>
          ) : holidays.length > 0 ? (
            <div className="space-y-2">
              {holidays.map((holiday) => (
                <div
                  key={`${holiday.date}-${holiday.localName}`}
                  className="rounded-md border border-primary/20 bg-background px-3 py-2 text-sm"
                >
                  <span className="font-medium text-card-foreground">{holiday.localName}</span>
                  <span className="ml-2 text-muted-foreground">
                    ({format(new Date(holiday.date), "MMM d, yyyy")})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No Israeli public holidays found within the first 15 weeks of leave.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to group timeline items for compact display
function groupTimelineItems(items: TimelineItem[]) {
  const result: (TimelineItem & { isGroup: boolean; groupEnd: number })[] = []
  
  // Always show first 3 weeks individually
  for (let i = 0; i < Math.min(3, items.length); i++) {
    result.push({ ...items[i], isGroup: false, groupEnd: items[i].week })
  }
  
  if (items.length <= 6) {
    for (let i = 3; i < items.length; i++) {
      result.push({ ...items[i], isGroup: false, groupEnd: items[i].week })
    }
    return result
  }
  
  // Group middle weeks (paid)
  const paidMiddleStart = 3
  const paidMiddleEnd = 14 // week 15 is the end of paid
  if (paidMiddleEnd > paidMiddleStart) {
    result.push({
      ...items[paidMiddleStart],
      isGroup: true,
      groupEnd: paidMiddleEnd,
      label: `Weeks ${paidMiddleStart + 1}-${paidMiddleEnd + 1}`,
    })
  }
  
  // Show week 15 (end of paid leave)
  if (items.length >= 15) {
    result.push({ ...items[14], isGroup: false, groupEnd: 15 })
  }
  
  // Group unpaid weeks if any
  if (items.length > 15) {
    const unpaidStart = 15
    const unpaidEnd = items.length - 2 // Leave last week separate
    
    if (unpaidEnd > unpaidStart) {
      result.push({
        ...items[unpaidStart],
        isGroup: true,
        groupEnd: unpaidEnd + 1,
        label: `Weeks ${unpaidStart + 1}-${unpaidEnd + 1}`,
      })
    }
    
    // Show last week
    result.push({ ...items[items.length - 1], isGroup: false, groupEnd: items.length })
  }
  
  return result
}
