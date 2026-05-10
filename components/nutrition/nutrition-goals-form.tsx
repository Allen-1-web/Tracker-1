'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import type { NutritionGoals } from '@/lib/types'

interface NutritionGoalsFormProps {
  onClose?: () => void
}

export function NutritionGoalsForm({ onClose }: NutritionGoalsFormProps) {
  const { nutritionGoals, updateNutritionGoals } = useStore()
  const [form, setForm] = useState<NutritionGoals>({ ...nutritionGoals })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    updateNutritionGoals(form)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose?.()
    }, 1000)
  }

  function field(
    key: keyof NutritionGoals,
    label: string,
    unit: string,
    hint: string
  ) {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium">
          {label} <span className="text-[var(--muted-foreground)] font-normal">({unit})</span>
        </label>
        <Input
          type="number"
          min="0"
          value={form[key]}
          onChange={(e) => setForm((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
        />
        <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {field('calories', 'Калории', 'ккал', 'Среднестатистическая норма: 1800–2500 ккал')}
      {field('protein',  'Белки',   'г',    'Рекомендуется 1.2–2 г на кг веса тела')}
      {field('fat',      'Жиры',    'г',    'Около 25–35% от суточной калорийности')}
      {field('carbs',    'Углеводы','г',    'Около 45–55% от суточной калорийности')}
      <Button className="w-full mt-2" onClick={handleSave} disabled={saved}>
        {saved ? '✓ Сохранено!' : 'Сохранить цели'}
      </Button>
    </div>
  )
}
