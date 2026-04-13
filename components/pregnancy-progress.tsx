"use client"

import * as React from "react"
import { differenceInDays, addDays } from "date-fns"

interface PregnancyProgressProps {
  dueDate: Date
}

const TOTAL_PREGNANCY_DAYS = 40 * 7 // 40 weeks = 280 days

export function PregnancyProgress({ dueDate }: PregnancyProgressProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  
  // Calculate pregnancy start date (40 weeks before due date)
  const pregnancyStartDate = addDays(due, -TOTAL_PREGNANCY_DAYS)
  
  // Calculate days passed and days remaining
  const daysFromStart = differenceInDays(today, pregnancyStartDate)
  const daysRemaining = differenceInDays(due, today)
  
  // Calculate progress percentage (clamped between 0 and 100)
  const progressPercent = Math.min(100, Math.max(0, (daysFromStart / TOTAL_PREGNANCY_DAYS) * 100))
  
  // Calculate current week (1-40)
  const currentWeek = Math.min(40, Math.max(1, Math.ceil(daysFromStart / 7)))
  
  // Determine trimester
  const getTrimester = (week: number): { name: string; color: string } => {
    if (week <= 12) return { name: "First Trimester", color: "text-rose-500" }
    if (week <= 27) return { name: "Second Trimester", color: "text-amber-500" }
    return { name: "Third Trimester", color: "text-teal-500" }
  }
  
  const trimester = getTrimester(currentWeek)
  
  // Handle cases where the baby is already born
  const isBorn = daysRemaining < 0

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-2xl font-bold text-foreground">{currentWeek}</p>
          <p className="text-xs text-muted-foreground">Current Week</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className={`text-sm font-semibold ${trimester.color}`}>{trimester.name}</p>
          <p className="text-xs text-muted-foreground">Stage</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-2xl font-bold text-foreground">
            {isBorn ? "0" : daysRemaining}
          </p>
          <p className="text-xs text-muted-foreground">Days Left</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Week 1</span>
          <span className="font-medium text-foreground">
            {isBorn ? "Baby is here!" : `${Math.round(progressPercent)}% complete`}
          </span>
          <span>Week 40</span>
        </div>
        
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
          {/* Gradient Progress Fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, #f472b6 0%, #fb923c 50%, #2dd4bf 100%)",
            }}
          />
          
          {/* Trimester Markers */}
          <div 
            className="absolute top-0 h-full w-px bg-foreground/20" 
            style={{ left: "30%" }} 
            title="End of First Trimester"
          />
          <div 
            className="absolute top-0 h-full w-px bg-foreground/20" 
            style={{ left: "67.5%" }} 
            title="End of Second Trimester"
          />
        </div>

        {/* Trimester Labels */}
        <div className="flex text-xs text-muted-foreground">
          <div className="w-[30%] text-center">1st</div>
          <div className="w-[37.5%] text-center">2nd</div>
          <div className="w-[32.5%] text-center">3rd</div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-teal-500/10 p-3">
        <span className="text-sm text-muted-foreground">
          {isBorn ? (
            "Congratulations on your new arrival!"
          ) : daysRemaining <= 7 ? (
            "Almost there! The final countdown!"
          ) : daysRemaining <= 30 ? (
            "Home stretch! Just a few more weeks to go!"
          ) : (
            `${Math.floor(daysFromStart / 7)} weeks down, ${Math.ceil(daysRemaining / 7)} weeks to go`
          )}
        </span>
      </div>
    </div>
  )
}
