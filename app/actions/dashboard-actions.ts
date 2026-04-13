"use server"

import type { LeaveType } from "@/components/leave-timeline"
import { supabaseServer } from "@/src/lib/supabase-server"
import { calculateLeaveDashboardData } from "@/src/lib/server/leave-calculations"

export async function getProfileByUserId(userId: string) {
  if (!userId) return null

  const { data, error } = await supabaseServer
    .from("profiles")
    .select("due_date, gender, checklist_items")
    .eq("id", userId)
    .single()

  if (error || !data) return null
  return data
}

export async function upsertProfileByUserId(
  userId: string,
  payload: { dueDate?: string; gender: "girl" | "boy"; checklistItems: string[] }
) {
  if (!userId) return

  await supabaseServer.from("profiles").upsert({
    id: userId,
    due_date: payload.dueDate ?? null,
    gender: payload.gender,
    checklist_items: payload.checklistItems,
    updated_at: new Date().toISOString(),
  })
}

export async function getLeaveDashboardDataAction(dueDateIso: string, leaveType: LeaveType) {
  if (!dueDateIso) return null
  return calculateLeaveDashboardData(dueDateIso, leaveType)
}
