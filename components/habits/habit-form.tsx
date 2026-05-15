'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Habit } from '@/lib/types'
import { useStore } from '@/lib/store'
import { cn, formFieldErrorClass } from '@/lib/utils'

const ICONS = ['🏋️', '📖', '💧', '🧘', '🇬🇧', '🏃', '🎸', '✍️', '💊', '🛌', '🍎', '💰', '🚶', '🌿', '🧹']
const COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#a855f7', '#ef4444']
const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

const schema = z
  .object({
    name: z.string().trim().min(1, 'Введите название'),
    icon: z.string().min(1, 'Выберите иконку'),
    color: z.string().min(1, 'Выберите цвет'),
    category: z.string().min(1, 'Выберите категорию'),
    frequencyType: z.enum(['daily', 'custom']),
    frequencyDays: z.array(z.number()),
  })
  .superRefine((data, ctx) => {
    if (data.frequencyType === 'custom' && data.frequencyDays.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Выберите хотя бы один день недели',
        path: ['frequencyDays'],
      })
    }
  })

type FormData = z.infer<typeof schema>

interface HabitFormProps {
  defaultValues?: Partial<Habit>
  onSubmit: (data: Omit<Habit, 'id' | 'createdAt'>) => void
  onCancel: () => void
  submitLabel?: string
}

export function HabitForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Сохранить' }: HabitFormProps) {
  const { categories } = useStore()
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      name: defaultValues?.name ?? '',
      icon: defaultValues?.icon ?? '🏋️',
      color: defaultValues?.color ?? '#6366f1',
      category: defaultValues?.category ?? '',
      frequencyType: Array.isArray(defaultValues?.frequency) ? 'custom' : 'daily',
      frequencyDays: Array.isArray(defaultValues?.frequency) ? (defaultValues.frequency as number[]) : [],
    },
  })

  const selectedIcon = watch('icon')
  const selectedColor = watch('color')
  const frequencyType = watch('frequencyType')
  const frequencyDays = watch('frequencyDays') ?? []

  const toggleDay = (day: number) => {
    const current = frequencyDays
    if (current.includes(day)) {
      setValue('frequencyDays', current.filter((d) => d !== day), { shouldValidate: true })
    } else {
      setValue('frequencyDays', [...current, day].sort(), { shouldValidate: true })
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label>Название</Label>
        <Input
          placeholder="Например: Утренняя зарядка"
          aria-invalid={!!errors.name}
          className={formFieldErrorClass(!!errors.name)}
          {...register('name')}
        />
        {errors.name && <p className="text-xs text-[var(--destructive)]">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Иконка</Label>
        <div
          className={cn(
            'flex flex-wrap gap-2 rounded-lg p-1',
            errors.icon && formFieldErrorClass(true)
          )}
        >
          {ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setValue('icon', icon, { shouldValidate: true })}
              className={`rounded-lg border-2 p-2 text-xl transition-colors ${
                selectedIcon === icon
                  ? 'border-[var(--primary)]'
                  : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
        {errors.icon && <p className="text-xs text-[var(--destructive)]">{errors.icon.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Цвет</Label>
        <div
          className={cn(
            'flex flex-wrap gap-2 rounded-lg p-1',
            errors.color && formFieldErrorClass(true)
          )}
        >
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color, { shouldValidate: true })}
              className={`h-8 w-8 rounded-full border-2 transition-transform ${
                selectedColor === color ? 'scale-110 border-[var(--foreground)]' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        {errors.color && <p className="text-xs text-[var(--destructive)]">{errors.color.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Категория</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={!!errors.category} className={formFieldErrorClass(!!errors.category)}>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
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

      <div className="space-y-2">
        <Label>Частота</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setValue('frequencyType', 'daily', { shouldValidate: true })}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              frequencyType === 'daily'
                ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                : 'border-[var(--border)]'
            }`}
          >
            Ежедневно
          </button>
          <button
            type="button"
            onClick={() => setValue('frequencyType', 'custom', { shouldValidate: true })}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              frequencyType === 'custom'
                ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                : 'border-[var(--border)]'
            }`}
          >
            По дням
          </button>
        </div>

        {frequencyType === 'custom' && (
          <div
            className={cn(
              'flex gap-1.5 rounded-lg p-0.5',
              errors.frequencyDays && formFieldErrorClass(true)
            )}
          >
            {DAYS.map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(index)}
                className={`flex-1 rounded-lg border py-1.5 text-xs transition-colors ${
                  frequencyDays.includes(index)
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                    : 'border-[var(--border)] hover:bg-[var(--accent)]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        )}
        {errors.frequencyDays && (
          <p className="text-xs text-[var(--destructive)]">{errors.frequencyDays.message}</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Отмена
        </Button>
        <Button type="submit" className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
