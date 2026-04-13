"use client"

import * as React from "react"
import { differenceInDays } from "date-fns"
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const WEEKLY_TIPS: Record<number, { title: string; tip: string }> = {
  1: { title: "The Beginning", tip: "Conception typically happens around week 2-3. Take prenatal vitamins with folic acid if you're planning to conceive." },
  2: { title: "Early Days", tip: "Your body is preparing for pregnancy. Make sure to get enough rest and maintain a healthy diet." },
  3: { title: "Implantation", tip: "The fertilized egg implants in the uterus. You might experience light spotting." },
  4: { title: "Positive Test", tip: "Many pregnancy tests can now detect pregnancy. Schedule your first prenatal appointment!" },
  5: { title: "Tiny Heart", tip: "Your baby's heart is starting to form. Continue taking prenatal vitamins daily." },
  6: { title: "First Heartbeat", tip: "The baby's heart begins to beat! Morning sickness may start around this time." },
  7: { title: "Growing Fast", tip: "Baby is about the size of a blueberry. Stay hydrated to help with nausea." },
  8: { title: "First Ultrasound", tip: "You may have your first ultrasound soon. Start a pregnancy journal to capture memories." },
  9: { title: "End of Embryo Stage", tip: "Baby graduates from embryo to fetus! All essential organs have begun to form." },
  10: { title: "Fingernails Forming", tip: "Tiny fingernails are developing. Consider shopping for comfortable maternity clothes." },
  11: { title: "Moving Around", tip: "Baby starts moving, though you can't feel it yet. Keep up with gentle exercise." },
  12: { title: "End of First Trimester", tip: "Congratulations on completing the first trimester! Risk of miscarriage decreases significantly." },
  13: { title: "Second Trimester Begins", tip: "Many women feel more energetic now. It's a great time to start planning the nursery." },
  14: { title: "Growing Bump", tip: "Your baby bump may start showing. Consider pregnancy-safe skincare for stretch marks." },
  15: { title: "Sense of Taste", tip: "Baby is developing taste buds. Eat a variety of healthy foods!" },
  16: { title: "Gender Reveal Soon", tip: "You may be able to find out the gender at your next ultrasound if you wish." },
  17: { title: "Skeleton Forming", tip: "Baby's skeleton is changing from cartilage to bone. Make sure you're getting enough calcium." },
  18: { title: "First Kicks", tip: "You might start feeling baby's movements! These first flutters are called 'quickening'." },
  19: { title: "Halfway There", tip: "You're almost halfway through! Consider signing up for prenatal classes." },
  20: { title: "Anatomy Scan", tip: "The detailed anatomy ultrasound usually happens this week. You'll see baby in detail!" },
  21: { title: "Baby Can Hear", tip: "Baby can now hear sounds! Talk, sing, or play music for your little one." },
  22: { title: "Fingerprints", tip: "Baby's unique fingerprints are forming. Start thinking about baby names if you haven't!" },
  23: { title: "Weight Gain", tip: "Baby is gaining weight rapidly. Focus on nutritious foods and staying active." },
  24: { title: "Viability Week", tip: "A major milestone! Babies born after this week have a chance of survival with intensive care." },
  25: { title: "Hair Growth", tip: "Baby may have hair growing on their head. Your belly is getting bigger - take bump photos!" },
  26: { title: "Eyes Opening", tip: "Baby's eyes are opening! They can sense light and dark in the womb." },
  27: { title: "Third Trimester Soon", tip: "Last week of the second trimester. Start preparing your hospital bag list." },
  28: { title: "Third Trimester Begins", tip: "Welcome to the third trimester! Time to start thinking about a birth plan." },
  29: { title: "Brain Development", tip: "Baby's brain is developing rapidly. Omega-3 fatty acids are especially important now." },
  30: { title: "Counting Kicks", tip: "Start doing daily kick counts. Report any significant changes to your doctor." },
  31: { title: "Five Senses", tip: "All five senses are now functional! Baby can see, hear, taste, touch, and smell." },
  32: { title: "Practicing Breathing", tip: "Baby is practicing breathing movements. Tour the hospital or birth center if you can." },
  33: { title: "Rapid Growth", tip: "Baby is growing about half a pound per week. Pack your hospital bag soon!" },
  34: { title: "Almost Full Term", tip: "Baby's lungs are almost fully developed. Review your birth plan with your partner." },
  35: { title: "Head Down Position", tip: "Most babies move into head-down position. Install the car seat and have it checked." },
  36: { title: "Weekly Appointments", tip: "You'll likely have weekly prenatal visits now. Finalize childcare arrangements." },
  37: { title: "Early Term", tip: "Baby is considered early term! They could arrive any time in the next few weeks." },
  38: { title: "Full Term", tip: "Congratulations, you're full term! Baby is ready to meet the world. Rest as much as possible." },
  39: { title: "Any Day Now", tip: "Baby could arrive any moment! Make sure your hospital bag is by the door." },
  40: { title: "Due Date Week", tip: "This is it - your due date week! Stay calm, trust your body, and call your doctor with any concerns." },
  41: { title: "Past Due Date", tip: "Don't worry - many babies arrive after their due date. Your doctor will monitor you closely." },
  42: { title: "Post-Term", tip: "Your doctor will discuss options for inducing labor. Baby will be here very soon!" },
}

interface WeeklyTipProps {
  dueDate: Date
}

export function WeeklyTip({ dueDate }: WeeklyTipProps) {
  const [browseWeek, setBrowseWeek] = React.useState<number | null>(null)

  // Calculate current pregnancy week (40 weeks = 280 days)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  
  const daysUntilDue = differenceInDays(due, today)
  const daysPregnant = 280 - daysUntilDue
  const currentWeek = Math.min(42, Math.max(1, Math.ceil(daysPregnant / 7)))
  
  const displayWeek = browseWeek ?? currentWeek
  const tipData = WEEKLY_TIPS[displayWeek] || WEEKLY_TIPS[40]
  
  const canGoPrev = displayWeek > 1
  const canGoNext = displayWeek < 42
  const isCurrentWeek = displayWeek === currentWeek

  const handlePrevWeek = () => {
    if (canGoPrev) {
      setBrowseWeek(displayWeek - 1)
    }
  }

  const handleNextWeek = () => {
    if (canGoNext) {
      setBrowseWeek(displayWeek + 1)
    }
  }

  const handleReturnToCurrent = () => {
    setBrowseWeek(null)
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevWeek}
          disabled={!canGoPrev}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous week</span>
        </Button>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-primary">Week {displayWeek}</span>
            {isCurrentWeek && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Current
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{tipData.title}</p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextWeek}
          disabled={!canGoNext}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next week</span>
        </Button>
      </div>

      {/* Return to current week button */}
      {!isCurrentWeek && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReturnToCurrent}
            className="text-xs"
          >
            Return to Week {currentWeek}
          </Button>
        </div>
      )}

      {/* Tip Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Tip for Week {displayWeek}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {tipData.tip}
            </p>
          </div>
        </div>
        
        {/* Decorative element */}
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5" />
      </div>

      {/* Week Progress Dots */}
      <div className="flex justify-center gap-1">
        {[1, 2, 3].map((trimester) => {
          const startWeek = (trimester - 1) * 13 + 1
          const endWeek = trimester === 3 ? 40 : trimester * 13
          const isInTrimester = displayWeek >= startWeek && displayWeek <= endWeek
          
          return (
            <div
              key={trimester}
              className={`h-1.5 rounded-full transition-all ${
                isInTrimester 
                  ? "w-8 bg-primary" 
                  : "w-4 bg-muted"
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
