import { addWeeks, startOfDay } from "date-fns"
import type { LeaveType } from "@/components/leave-timeline"

export interface PublicHoliday {
  date: string
  localName: string
  name: string
}

const LEAVE_WEEK_MAP: Record<LeaveType, number> = {
  standard: 15,
  extended: 26,
  "full-year": 35,
}

export async function calculateLeaveDashboardData(dueDateIso: string, leaveType: LeaveType) {
  const dueDate = startOfDay(new Date(dueDateIso))
  const leaveStartDate = addWeeks(dueDate, -1)
  const paidEndDate = addWeeks(leaveStartDate, 15)
  const leaveEndDate = addWeeks(leaveStartDate, LEAVE_WEEK_MAP[leaveType])
  const holidays = await getIsraeliHolidaysInRange(leaveStartDate, paidEndDate)

  return {
    leaveStartDate: leaveStartDate.toISOString(),
    paidEndDate: paidEndDate.toISOString(),
    leaveEndDate: leaveEndDate.toISOString(),
    holidays,
  }
}

async function getIsraeliHolidaysInRange(startDate: Date, endDate: Date): Promise<PublicHoliday[]> {
  const startYear = startDate.getFullYear()
  const endYear = endDate.getFullYear()
  const years = startYear === endYear ? [startYear] : [startYear, endYear]

  const responses = await Promise.all(
    years.map((year) => fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IL`, { cache: "no-store" }))
  )

  const holidayLists = await Promise.all(
    responses.map(async (response) => (response.ok ? ((await response.json()) as PublicHoliday[]) : []))
  )

  return holidayLists
    .flat()
    .filter((holiday) => {
      const holidayDate = startOfDay(new Date(holiday.date))
      return holidayDate >= startDate && holidayDate <= endDate
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
