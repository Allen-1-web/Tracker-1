'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { NutritionSummary } from '@/components/nutrition/nutrition-summary'
import { FoodSearch } from '@/components/nutrition/food-search'
import { MealsList } from '@/components/nutrition/meals-list'
import { WeeklyNutritionChart } from '@/components/nutrition/weekly-nutrition-chart'
import { DietRecommendations } from '@/components/nutrition/diet-recommendations'
import { NutritionGoalsForm } from '@/components/nutrition/nutrition-goals-form'
import { useStore } from '@/lib/store'

export default function NutritionPage() {
  const { mealEntries, nutritionGoals } = useStore()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [goalsOpen, setGoalsOpen] = useState(false)

  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')

  const todayEntries = mealEntries.filter((e) => e.date === dateStr)

  function prevDay() {
    setCurrentDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() - 1)
      return next
    })
  }

  function nextDay() {
    setCurrentDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      return next
    })
  }

  const dateLabel = isToday
    ? 'Сегодня'
    : format(currentDate, 'd MMMM', { locale: ru })

  return (
    <AppLayout title="Питание">
      <div className="space-y-6 max-w-4xl min-w-0">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:justify-start">
            <button
              onClick={prevDay}
              className="p-1.5 rounded-lg hover:bg-[var(--accent)] transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-0 flex-1 text-center font-semibold text-base sm:flex-none sm:text-lg">
              {dateLabel}
            </span>
            <button
              onClick={nextDay}
              disabled={isToday}
              className="p-1.5 rounded-lg hover:bg-[var(--accent)] transition-colors disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <Button variant="outline" size="sm" className="w-full shrink-0 sm:w-auto" onClick={() => setGoalsOpen(true)}>
            <Settings2 className="h-4 w-4 mr-1.5" />
            Мои цели
          </Button>
        </div>

        {/* Summary */}
        <NutritionSummary entries={todayEntries} goals={nutritionGoals} />

        {/* Main two-column area */}
        <div className="grid grid-cols-1 gap-4 min-w-0 lg:grid-cols-5 lg:gap-6">
          {/* Food search */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Добавить еду</CardTitle>
            </CardHeader>
            <CardContent>
              <FoodSearch date={dateStr} />
            </CardContent>
          </Card>

          {/* Meals list */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base min-w-0">
                  {isToday ? 'Что я съел сегодня' : `Рацион за ${dateLabel}`}
                </CardTitle>
                {todayEntries.length > 0 && (
                  <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
                    {todayEntries.reduce((s, e) => s + e.calories, 0)} ккал
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <MealsList entries={todayEntries} />
            </CardContent>
          </Card>
        </div>

        {/* Weekly chart + recommendations */}
        <div className="grid grid-cols-1 gap-4 min-w-0 lg:grid-cols-5 lg:gap-6">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Калории за 7 дней</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyNutritionChart entries={mealEntries} goals={nutritionGoals} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Рекомендации</CardTitle>
            </CardHeader>
            <CardContent>
              <DietRecommendations entries={todayEntries} goals={nutritionGoals} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Goals dialog */}
      <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Дневные цели КБЖУ</DialogTitle>
          </DialogHeader>
          <NutritionGoalsForm onClose={() => setGoalsOpen(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
