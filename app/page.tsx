"use client"

import * as React from "react"
import { differenceInDays, addDays, format } from "date-fns"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/src/lib/supabase"
import { cn } from "@/lib/utils"
import { DatePicker } from "@/components/date-picker"
import { LeaveTimeline, LeaveType } from "@/components/leave-timeline"
import { BabyChecklist } from "@/components/baby-checklist"
import { ThemeToggle } from "@/components/theme-toggle"
import { PregnancyProgress } from "@/components/pregnancy-progress"
import { WeeklyTip } from "@/components/weekly-tip"
import { PdfExport } from "@/components/pdf-export"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Baby, CalendarDays, CheckSquare, Info, Clock, Heart, Sparkles, Lightbulb, Loader2, LogOut } from "lucide-react"
import { getLeaveDashboardDataAction, getProfileByUserId, upsertProfileByUserId } from "@/app/actions/dashboard-actions"

type BabyGender = "girl" | "boy"

const GENDER_THEME: Record<BabyGender, { primary: string; ring: string; accent: string }> = {
  girl: {
    primary: "oklch(0.72 0.14 345)",
    ring: "oklch(0.72 0.14 345)",
    accent: "oklch(0.88 0.09 320)",
  },
  boy: {
    primary: "oklch(0.74 0.12 240)",
    ring: "oklch(0.74 0.12 240)",
    accent: "oklch(0.87 0.08 220)",
  },
}

const LEAVE_OPTIONS: { value: LeaveType; label: string; description: string; weeks: number }[] = [
  { value: "standard", label: "Standard", description: "~3.5 months (15 weeks) - Paid", weeks: 15 },
  { value: "extended", label: "Extended", description: "6 months (26 weeks)", weeks: 26 },
  { value: "full-year", label: "Full Year", description: "8 months (35 weeks)", weeks: 35 },
]

const STORAGE_KEY_DUE_DATE = "shir-guy-due-date"
const STORAGE_KEY_LEAVE_TYPE = "shir-guy-leave-type"
const STORAGE_KEY_CHECKLIST = "shir-guy-baby-checklist"
const STORAGE_KEY_GENDER = "shir-guy-baby-gender"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function getLeaveWeeks(leaveType: LeaveType): number {
  return LEAVE_OPTIONS.find((opt) => opt.value === leaveType)?.weeks ?? 15
}

function getLeaveDurationLabel(leaveType: LeaveType): string {
  return LEAVE_OPTIONS.find((opt) => opt.value === leaveType)?.description ?? "15 weeks"
}

function getCountdownMessage(dueDate: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const daysLeft = differenceInDays(due, today)

  if (daysLeft < 0) {
    const daysAgo = Math.abs(daysLeft)
    if (daysAgo === 1) return "Your baby arrived yesterday! Mazal tov!"
    return `Your baby arrived ${daysAgo} days ago! Mazal tov!`
  }
  if (daysLeft === 0) return "Today is the day!"
  if (daysLeft === 1) return "Tomorrow is the big day!"
  return `${daysLeft} days to go!`
}

function getWelcomeMessage(gender: BabyGender): string {
  return gender === "girl" ? "מחכים לנסיכה הקטנה שלנו!" : "מחכים לנסיך הקטן שלנו!"
}

export default function Home() {
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined)
  const [leaveType, setLeaveType] = React.useState<LeaveType>("standard")
  const [gender, setGender] = React.useState<BabyGender>("girl")
  const [checkedItems, setCheckedItems] = React.useState<Set<string>>(new Set())
  const [isThemeAnimating, setIsThemeAnimating] = React.useState(false)

  const [session, setSession] = React.useState<Session | null>(null)
  const [authInitialized, setAuthInitialized] = React.useState(false)
  const [authMode, setAuthMode] = React.useState<"login" | "signup">("login")
  const [showAuthForm, setShowAuthForm] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [authLoading, setAuthLoading] = React.useState(false)
  const [authError, setAuthError] = React.useState<string | null>(null)
  const [serverHolidays, setServerHolidays] = React.useState<{ date: string; localName: string; name: string }[]>([])
  const [isLoadingServerHolidays, setIsLoadingServerHolidays] = React.useState(false)

  React.useEffect(() => {
    let isActive = true
    const initTimeout = window.setTimeout(() => {
      if (isActive) {
        setAuthInitialized(true)
      }
    }, 3000)

    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (isActive) {
          setSession(data.session)
        }
      } catch {
        if (isActive) {
          setSession(null)
        }
      } finally {
        if (isActive) {
          setAuthInitialized(true)
        }
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthInitialized(true)
    })

    return () => {
      isActive = false
      window.clearTimeout(initTimeout)
      subscription.unsubscribe()
    }
  }, [])

  React.useEffect(() => {
    const theme = GENDER_THEME[gender]
    const root = document.documentElement
    root.style.setProperty("--primary", theme.primary)
    root.style.setProperty("--ring", theme.ring)
    root.style.setProperty("--accent", theme.accent)
    root.style.setProperty("--chart-1", theme.primary)
  }, [gender])

  React.useEffect(() => {
    if (!authInitialized || session) return
    const savedDueDate = localStorage.getItem(STORAGE_KEY_DUE_DATE)
    const savedLeaveType = localStorage.getItem(STORAGE_KEY_LEAVE_TYPE)
    const savedGender = localStorage.getItem(STORAGE_KEY_GENDER)
    const savedChecklist = localStorage.getItem(STORAGE_KEY_CHECKLIST)

    if (savedDueDate) {
      const parsedDate = new Date(savedDueDate)
      if (!isNaN(parsedDate.getTime())) setDueDate(parsedDate)
    }
    if (savedLeaveType && ["standard", "extended", "full-year"].includes(savedLeaveType)) {
      setLeaveType(savedLeaveType as LeaveType)
    }
    if (savedGender === "girl" || savedGender === "boy") {
      setGender(savedGender)
    }
    if (savedChecklist) {
      try {
        setCheckedItems(new Set(JSON.parse(savedChecklist)))
      } catch {
        setCheckedItems(new Set())
      }
    }
  }, [authInitialized, session])

  React.useEffect(() => {
    if (!authInitialized || session) return
    if (dueDate) localStorage.setItem(STORAGE_KEY_DUE_DATE, dueDate.toISOString())
    else localStorage.removeItem(STORAGE_KEY_DUE_DATE)
  }, [dueDate, authInitialized, session])

  React.useEffect(() => {
    if (!authInitialized || session) return
    localStorage.setItem(STORAGE_KEY_LEAVE_TYPE, leaveType)
  }, [leaveType, authInitialized, session])

  React.useEffect(() => {
    if (!authInitialized || session) return
    localStorage.setItem(STORAGE_KEY_GENDER, gender)
  }, [gender, authInitialized, session])

  React.useEffect(() => {
    if (!authInitialized || session) {
      return
    }
    localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify([...checkedItems]))
  }, [checkedItems, authInitialized, session])

  React.useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) return

      const profile = await getProfileByUserId(session.user.id)
      if (!profile) return

      if (profile.due_date) {
        const parsedDate = new Date(profile.due_date)
        if (!isNaN(parsedDate.getTime())) setDueDate(parsedDate)
      } else {
        setDueDate(undefined)
      }

      if (profile.gender === "girl" || profile.gender === "boy") {
        setGender(profile.gender)
      }

      if (Array.isArray(profile.checklist_items)) {
        setCheckedItems(new Set(profile.checklist_items as string[]))
      } else {
        setCheckedItems(new Set())
      }
    }

    loadProfile()
  }, [session?.user?.id])

  React.useEffect(() => {
    const syncProfile = async () => {
      if (!session?.user?.id) return

      await upsertProfileByUserId(session.user.id, {
        dueDate: dueDate?.toISOString(),
        gender,
        checklistItems: [...checkedItems],
      })
    }
    syncProfile()
  }, [session?.user?.id, dueDate, gender, checkedItems])

  React.useEffect(() => {
    const loadServerDashboardData = async () => {
      if (!dueDate) {
        setServerHolidays([])
        return
      }

      setIsLoadingServerHolidays(true)
      const result = await getLeaveDashboardDataAction(dueDate.toISOString(), leaveType)
      setServerHolidays(result?.holidays ?? [])
      setIsLoadingServerHolidays(false)
    }

    loadServerDashboardData()
  }, [dueDate, leaveType])

  const leaveStartDate = dueDate ? addDays(dueDate, -7) : null
  const leaveEndDate = dueDate ? addDays(leaveStartDate!, getLeaveWeeks(leaveType) * 7) : null

  const handleGenderChange = (value: BabyGender) => {
    if (value === gender) return
    setGender(value)
    setIsThemeAnimating(true)
    window.setTimeout(() => setIsThemeAnimating(false), 350)
  }

  const handleShareToWhatsApp = () => {
    if (!dueDate || !leaveStartDate || !leaveEndDate) return

    const message = `Hey! Here is our maternity leave plan:

Due Date: ${format(dueDate, "MMMM d, yyyy")}
Start: ${format(leaveStartDate, "MMMM d, yyyy")}
Return: ${format(leaveEndDate, "MMMM d, yyyy")}
Total Duration: ${getLeaveDurationLabel(leaveType)}`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <main className={cn("min-h-screen bg-background", isThemeAnimating && "theme-fade-in")}>
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Baby className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-card-foreground sm:text-2xl" dir="rtl">
                מחשבון חופשת לידה
              </h1>
              <p className="text-sm text-muted-foreground">Israel Maternity Leave Calculator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session && dueDate && (
              <PdfExport dueDate={dueDate} leaveType={leaveType} checkedItems={checkedItems} iconOnly />
            )}
            <ThemeToggle />
            {session && (
              <Button variant="outline" size="icon" onClick={handleLogout} title="Logout" aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {!session ? (
        <section className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-gradient-to-b from-background to-primary/5 px-4">
          <div className="w-full max-w-3xl rounded-2xl border bg-card/90 p-8 text-center shadow-sm backdrop-blur-sm theme-fade-in">
            <h2 className="text-3xl font-bold text-card-foreground" dir="rtl">
              ברוכים הבאים למחשבון חופשת הלידה שלכם
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground" dir="rtl">
              המקום שבו תוכלו לתכנן את הלו״ז, לנהל צ׳ק-ליסט ולשתף את התאריכים החשובים.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                className="min-w-32 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  setAuthMode("login")
                  setShowAuthForm(true)
                }}
              >
                Login
              </Button>
              <Button
                variant="outline"
                className="min-w-32 border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => {
                  setAuthMode("signup")
                  setShowAuthForm(true)
                }}
              >
                Sign Up
              </Button>
            </div>

            {showAuthForm && (
              <form onSubmit={handleAuthSubmit} className="mx-auto mt-8 max-w-md space-y-4 text-left">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                {authError && <p className="text-sm text-destructive">{authError}</p>}
                <Button type="submit" disabled={authLoading} className="w-full">
                  {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {authMode === "login" ? "Login" : "Create Account"}
                </Button>
              </form>
            )}
          </div>
        </section>
      ) : (
        <div className="mx-auto max-w-5xl px-4 py-8">
          {dueDate && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-primary/10 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-primary">{getCountdownMessage(dueDate)}</p>
                <p className="text-sm text-primary/90">{getWelcomeMessage(gender)}</p>
              </div>
              <Heart className="ml-auto h-5 w-5 shrink-0 text-primary" />
            </div>
          )}

          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Gender Theme</p>
                <div className="inline-flex rounded-lg border bg-background p-1">
                  <button
                    type="button"
                    onClick={() => handleGenderChange("boy")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      gender === "boy" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    בן Boy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange("girl")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      gender === "girl" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    בת Girl
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {dueDate && (
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Baby className="h-5 w-5 text-primary" />
                    Pregnancy Progress
                  </CardTitle>
                  <CardDescription>Tracking your 40-week journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <PregnancyProgress dueDate={dueDate} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Weekly Tip
                  </CardTitle>
                  <CardDescription>Helpful advice for each week of your pregnancy</CardDescription>
                </CardHeader>
                <CardContent>
                  <WeeklyTip dueDate={dueDate} />
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-card-foreground">About Israeli Maternity Leave</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  In Israel, mothers are entitled to 15 weeks of paid maternity leave from Bituach Leumi (National Insurance).
                  You can extend your leave up to 6-8 months with additional unpaid time. This calculator assumes leave starts
                  1 week before your due date.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Configure Your Leave
              </CardTitle>
              <CardDescription>Select your due date and choose your leave duration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Expected Due Date</label>
                <div className="max-w-sm">
                  <DatePicker date={dueDate} onDateChange={setDueDate} placeholder="Pick your due date" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Leave Duration
                </label>
                <div className="flex flex-wrap gap-3">
                  {LEAVE_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={leaveType === option.value ? "default" : "outline"}
                      className={cn(
                        "h-auto flex-col items-start px-4 py-3 text-left",
                        leaveType === option.value ? "ring-2 ring-primary ring-offset-2" : "hover:bg-secondary"
                      )}
                      onClick={() => setLeaveType(option.value)}
                    >
                      <span className="font-semibold">{option.label}</span>
                      <span className={cn("text-xs", leaveType === option.value ? "text-primary-foreground/80" : "text-muted-foreground")}>
                        {option.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-none sm:inline-flex">
              <TabsTrigger value="timeline" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>Leave Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="checklist" className="gap-2">
                <CheckSquare className="h-4 w-4" />
                <span>Baby Checklist</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Your {leaveType === "standard" ? "15-Week" : leaveType === "extended" ? "6-Month" : "8-Month"} Leave Timeline
                  </CardTitle>
                  <CardDescription>Visualize your maternity leave from start to finish (starting 1 week before due date)</CardDescription>
                </CardHeader>
                <CardContent>
                  {dueDate ? (
                    <LeaveTimeline
                      dueDate={dueDate}
                      leaveType={leaveType}
                      holidays={serverHolidays}
                      isLoadingHolidays={isLoadingServerHolidays}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <CalendarDays className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="mt-4 text-lg font-medium text-foreground">Select a due date above</p>
                      <p className="mt-1 text-sm text-muted-foreground">Your personalized leave timeline will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="checklist">
              <Card>
                <CardHeader>
                  <CardTitle>Baby Gear Checklist</CardTitle>
                  <CardDescription>Everything you need to prepare for your little one</CardDescription>
                </CardHeader>
                <CardContent>
                  <BabyChecklist checkedItems={checkedItems} onCheckedItemsChange={setCheckedItems} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {session && (
        <button
          onClick={handleShareToWhatsApp}
          disabled={!dueDate}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 min-h-14 min-w-14 max-h-14 max-w-14 items-center justify-center rounded-full bg-[#25D366] p-0 text-white leading-none shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Share to WhatsApp"
          title={dueDate ? "Share to WhatsApp" : "Select a due date to enable sharing"}
        >
          <WhatsAppIcon className="h-7 w-7 shrink-0 text-white" />
        </button>
      )}
    </main>
  )
}
