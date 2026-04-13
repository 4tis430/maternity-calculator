"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Baby, Bed, ShoppingBag, Shirt, Car, Heart, Trophy, Star, Sparkles } from "lucide-react"

interface ChecklistItem {
  id: string
  label: string
  category: string
}

const checklistData: ChecklistItem[] = [
  // Nursery
  { id: "crib", label: "Crib or bassinet", category: "Nursery" },
  { id: "mattress", label: "Crib mattress", category: "Nursery" },
  { id: "sheets", label: "Fitted sheets (2-3)", category: "Nursery" },
  { id: "blankets", label: "Swaddle blankets", category: "Nursery" },
  { id: "monitor", label: "Baby monitor", category: "Nursery" },
  
  // Clothing
  { id: "onesies", label: "Onesies (5-7)", category: "Clothing" },
  { id: "sleepsuits", label: "Sleep suits (3-5)", category: "Clothing" },
  { id: "socks", label: "Socks and booties", category: "Clothing" },
  { id: "hats", label: "Hats for warmth", category: "Clothing" },
  
  // Feeding
  { id: "bottles", label: "Bottles and nipples", category: "Feeding" },
  { id: "pump", label: "Breast pump", category: "Feeding" },
  { id: "nursing", label: "Nursing pillows", category: "Feeding" },
  { id: "bibs", label: "Burp cloths and bibs", category: "Feeding" },
  
  // Travel
  { id: "carseat", label: "Car seat", category: "Travel" },
  { id: "stroller", label: "Stroller", category: "Travel" },
  { id: "carrier", label: "Baby carrier/wrap", category: "Travel" },
  { id: "diaperbag", label: "Diaper bag", category: "Travel" },
  
  // Essentials
  { id: "diapers", label: "Diapers (newborn size)", category: "Essentials" },
  { id: "wipes", label: "Baby wipes", category: "Essentials" },
  { id: "cream", label: "Diaper cream", category: "Essentials" },
  { id: "thermometer", label: "Baby thermometer", category: "Essentials" },
  { id: "bath", label: "Baby bathtub", category: "Essentials" },
]

const categoryIcons: Record<string, React.ReactNode> = {
  Nursery: <Bed className="h-4 w-4" />,
  Clothing: <Shirt className="h-4 w-4" />,
  Feeding: <Baby className="h-4 w-4" />,
  Travel: <Car className="h-4 w-4" />,
  Essentials: <Heart className="h-4 w-4" />,
}

const STORAGE_KEY = "shir-guy-baby-checklist"

// Confetti particle component
function ConfettiParticle({ 
  color, 
  x, 
  delay 
}: { 
  color: string
  x: number
  delay: number 
}) {
  return (
    <div
      className="pointer-events-none absolute h-2 w-2 animate-confetti rounded-full"
      style={{
        backgroundColor: color,
        left: `${x}%`,
        animationDelay: `${delay}ms`,
      }}
    />
  )
}

// Confetti burst component
function ConfettiBurst({ show }: { show: boolean }) {
  const colors = ["#f59e0b", "#ec4899", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444"]
  
  if (!show) return null
  
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <ConfettiParticle
          key={i}
          color={colors[i % colors.length]}
          x={Math.random() * 100}
          delay={Math.random() * 200}
        />
      ))}
    </div>
  )
}

// Level badge based on progress
function getLevelInfo(progress: number): { level: string; icon: React.ReactNode; color: string } {
  if (progress === 100) {
    return { level: "Parent Pro", icon: <Trophy className="h-5 w-5" />, color: "text-yellow-500" }
  }
  if (progress >= 75) {
    return { level: "Almost There", icon: <Star className="h-5 w-5" />, color: "text-primary" }
  }
  if (progress >= 50) {
    return { level: "Getting Ready", icon: <Sparkles className="h-5 w-5" />, color: "text-accent-foreground" }
  }
  if (progress >= 25) {
    return { level: "Starter Parent", icon: <Baby className="h-5 w-5" />, color: "text-muted-foreground" }
  }
  return { level: "Beginner", icon: <Baby className="h-5 w-5" />, color: "text-muted-foreground" }
}

interface BabyChecklistProps {
  checkedItems?: Set<string>
  onCheckedItemsChange?: (items: Set<string>) => void
}

export function BabyChecklist({ checkedItems: externalCheckedItems, onCheckedItemsChange }: BabyChecklistProps = {}) {
  const [checkedItems, setCheckedItems] = React.useState<Set<string>>(new Set())
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [showConfetti, setShowConfetti] = React.useState(false)
  const [confettiKey, setConfettiKey] = React.useState(0)

  const isControlled = externalCheckedItems !== undefined
  const activeCheckedItems = isControlled ? externalCheckedItems : checkedItems

  // Load from localStorage on mount
  React.useEffect(() => {
    if (!isControlled) {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setCheckedItems(new Set(parsed))
        } catch {
          // Invalid data, start fresh
        }
      }
    }
    setIsLoaded(true)
  }, [isControlled])

  // Save to localStorage whenever checkedItems changes
  React.useEffect(() => {
    if (isLoaded && !isControlled) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...activeCheckedItems]))
    }
  }, [activeCheckedItems, isLoaded, isControlled])

  const toggleItem = (id: string) => {
    const updateFn = (prev: Set<string>) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        // Trigger confetti when checking (not unchecking)
        setShowConfetti(true)
        setConfettiKey((k) => k + 1)
        setTimeout(() => setShowConfetti(false), 800)
      }
      return next
    }

    if (isControlled && externalCheckedItems && onCheckedItemsChange) {
      onCheckedItemsChange(updateFn(new Set(externalCheckedItems)))
      return
    }

    setCheckedItems((prev) => updateFn(prev))
  }

  const categories = Array.from(new Set(checklistData.map((item) => item.category)))
  
  const totalItems = checklistData.length
  const completedItems = activeCheckedItems.size
  const progress = Math.round((completedItems / totalItems) * 100)
  const levelInfo = getLevelInfo(progress)
  const isComplete = progress === 100

  return (
    <div className="relative space-y-6">
      {/* Confetti animation */}
      <ConfettiBurst key={confettiKey} show={showConfetti} />

      {/* Gamified Progress Bar */}
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("transition-all", levelInfo.color, isComplete && "animate-bounce")}>
              {levelInfo.icon}
            </div>
            <span className="font-semibold text-foreground">Leveling up for Parenthood</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", levelInfo.color)}>
              {levelInfo.level}
            </span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="h-4 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                isComplete 
                  ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500" 
                  : "bg-gradient-to-r from-primary/80 via-primary to-primary/80"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completedItems} of {totalItems} items
            </span>
            <span className={cn("font-bold", isComplete ? "text-yellow-500" : "text-primary")}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Milestone markers */}
        <div className="flex justify-between px-1">
          {[25, 50, 75, 100].map((milestone) => (
            <div 
              key={milestone} 
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                progress >= milestone ? "opacity-100" : "opacity-40"
              )}
            >
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                progress >= milestone 
                  ? milestone === 100 
                    ? "bg-yellow-500 text-white" 
                    : "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}>
                {milestone === 100 ? <Trophy className="h-3 w-3" /> : `${milestone}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion celebration */}
      {isComplete && (
        <div className="flex items-center gap-4 rounded-xl border-2 border-yellow-400/50 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 dark:from-yellow-950/30 dark:to-amber-950/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-white">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-yellow-600 dark:text-yellow-400">
              Achievement Unlocked: Parent Pro!
            </p>
            <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80">
              You&apos;ve completed all preparations. You&apos;re ready for your little princess!
            </p>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((category) => {
          const items = checklistData.filter((item) => item.category === category)
          const categoryCompleted = items.filter((item) => activeCheckedItems.has(item.id)).length
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {categoryIcons[category]}
                </div>
                <h3 className="font-semibold text-foreground">{category}</h3>
                <span className="ml-auto text-sm text-muted-foreground">
                  {categoryCompleted}/{items.length}
                </span>
              </div>
              
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => {
                  const isChecked = activeCheckedItems.has(item.id)
                  
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-all hover:border-primary/50",
                        isChecked && "border-primary/30 bg-primary/5"
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <span
                        className={cn(
                          "text-sm text-card-foreground transition-all",
                          isChecked && "text-muted-foreground line-through"
                        )}
                      >
                        {item.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
