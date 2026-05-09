'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Habit } from '@/lib/types'
import { mockCategories } from '@/lib/mock-data'

const ICONS = ['🏋️', '📖', '💧', '🧘', '🇬🇧', '🏃', '🎸', '✍️', '💊', '🛌', '🍎', '💰', '🚶', '🌿', '🧹']
const COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#a855f7', '#ef4444']
const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

const schema = z.object({
  name: z.string().min(1, 'Введите название'),
  icon: z.string().min(1),
  color: z.string().min(1),
  category: z.string().min(1, 'Выберите категорию'),
  frequencyType: z.enum(['daily', 'custom']),
  frequencyDays: z.array(z.number()).optional(),
})

type FormData = z.infer<typeof schema>

interface HabitFormProps {
  defaultValues?: Partial<Habit>
  onSubmit: (data: Omit<Habit, 'id' | 'createdAt'>) => void
  onCancel: () => void
  submitLabel?: string
}

export function HabitForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Сохранить' }: HabitFormProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      icon: defaultValues?.icon ?? '🏋️',
      color: defaultValues?.color ?? '#6366f1',
      category: defaultValues?.category ?? '',
      frequencyType: Array.isArray(defaultValues?.frequency) ? 'custom' : 'daily',
      frequencyDays: Array.isArray(defaultValues?.frequency) ? defaultValues.frequency as number[] : [],
    },
  })

  const selectedIcon = watch('icon')
  const selectedColor = watch('color')
  const frequencyType = watch('frequencyType')
  const frequencyDays = watch('frequencyDays') ?? []

  const toggleDay = (day: number) => {
    const current = frequencyDays
    if (current.includes(day)) {
      setValue('frequencyDays', current.filter((d) => d !== day))
    } else {
      setValue('frequencyDays', [...current, day].sort())
    }
  }

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      name: data.name,
      icon: data.icon,
      color: data.color,
      category: data.category,
      frequency: data.frequencyType === 'daily' ? 'daily' : (data.frequencyDays ?? []),
      isArchived: false,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label>Название</Label>
        <Input placeholder="Например: Утренняя зарядка" {...register('name')} />
        {errors.name && <p className="text-xs text-[var(--destructive)]">{errors.name.message}</p>}
      </div>

      {/* Icon */}
      <div className="space-y-1.5">
        <Label>Иконка</Label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setValue('icon', icon)}
              className={`text-xl p-2 rounded-lg border-2 transition-colors ${
                selectedIcon === icon ? 'border-[var(--primary)]' : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <Label>Цвет</Label>
        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`h-8 w-8 rounded-full border-2 transition-transform ${
                selectedColor === color ? 'border-[var(--foreground)] scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Категория</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {mockCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && <p className="text-xs text-[var(--destructive)]">{errors.category.message}</p>}
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Label>Частота</Label>
        <div className="flex gap-2">
          <Controller
            control={control}
            name="frequencyType"
            render={({ field }) => (
              <>
                <button
                  type="button"
                  onClick={() => field.onChange('daily')}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    field.value === 'daily' ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border)]'
                  }`}
                >
                  Ежедневно
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange('custom')}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    field.value === 'custom' ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border)]'
                  }`}
                >
                  По дням
                </button>
              </>
            )}
          />
        </div>

        {frequencyType === 'custom' && (
          <div className="flex gap-1.5">
            {DAYS.map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(index)}
                className={`flex-1 py-1.5 rounded-lg text-xs border transition-colors ${
                  frequencyDays.includes(index)
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'border-[var(--border)] hover:bg-[var(--accent)]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Отмена
        </Button>
        <Button type="submit" className="flex-1">{submitLabel}</Button>
      </div>
    </form>
  )
}
