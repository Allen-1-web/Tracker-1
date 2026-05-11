'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { mockCategories } from '@/lib/mock-data'
import { useStore } from '@/lib/store'
import { formFieldErrorClass, cn } from '@/lib/utils'
import type { Goal } from '@/lib/types'

const schema = z.object({
  name: z.string().trim().min(1, 'Введите название'),
  description: z.string().optional(),
  type: z.enum(['numeric', 'binary']),
  targetValue: z
    .custom<number>(
      (v) => typeof v === 'number' && Number.isFinite(v) && !Number.isNaN(v) && v >= 1,
      { message: 'Введите число не меньше 1' }
    ),
  unit: z.string().optional(),
  category: z.string().min(1, 'Выберите категорию'),
  deadline: z
    .string()
    .min(1, 'Укажите дедлайн')
    .refine((s) => !Number.isNaN(Date.parse(s)), 'Некорректная дата'),
  linkedHabitIds: z.array(z.string()),
})

type FormData = z.infer<typeof schema>

interface GoalFormProps {
  defaultValues?: Partial<Goal>
  onSubmit: (data: Omit<Goal, 'id' | 'createdAt' | 'currentValue'>) => void
  onCancel: () => void
  submitLabel?: string
}

export function GoalForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Сохранить' }: GoalFormProps) {
  const { habits } = useStore()
  const activeHabits = habits.filter((h) => !h.isArchived)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      type: defaultValues?.type ?? 'numeric',
      targetValue: defaultValues?.targetValue ?? 10,
      unit: defaultValues?.unit ?? '',
      category: defaultValues?.category ?? '',
      deadline: defaultValues?.deadline ? new Date(defaultValues.deadline).toISOString().split('T')[0] : '',
      linkedHabitIds: defaultValues?.linkedHabitIds ?? [],
    },
  })

  const linkedHabitIds = watch('linkedHabitIds')
  const goalType = watch('type')

  const toggleHabit = (id: string) => {
    if (linkedHabitIds.includes(id)) {
      setValue('linkedHabitIds', linkedHabitIds.filter((h) => h !== id), { shouldValidate: true })
    } else {
      setValue('linkedHabitIds', [...linkedHabitIds, id], { shouldValidate: true })
    }
  }

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      name: data.name,
      description: data.description,
      type: data.type,
      targetValue: data.targetValue,
      unit: data.unit,
      category: data.category,
      deadline: new Date(data.deadline),
      linkedHabitIds: data.linkedHabitIds,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label>Название</Label>
        <Input
          placeholder="Например: Прочитать 20 книг"
          aria-invalid={!!errors.name}
          className={formFieldErrorClass(!!errors.name)}
          {...register('name')}
        />
        {errors.name && <p className="text-xs text-[var(--destructive)]">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Описание (необязательно)</Label>
        <Textarea placeholder="Дополнительная информация..." {...register('description')} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Тип цели</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!errors.type} className={formFieldErrorClass(!!errors.type)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numeric">Числовая</SelectItem>
                  <SelectItem value="binary">Бинарная</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && <p className="text-xs text-[var(--destructive)]">{errors.type.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Целевое значение</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              aria-invalid={!!errors.targetValue}
              className={cn('flex-1', formFieldErrorClass(!!errors.targetValue))}
              {...register('targetValue', { valueAsNumber: true })}
              disabled={goalType === 'binary'}
            />
            <Input placeholder="ед." {...register('unit')} className="w-20" />
          </div>
          {errors.targetValue && (
            <p className="text-xs text-[var(--destructive)]">{errors.targetValue.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Категория</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!errors.category} className={formFieldErrorClass(!!errors.category)}>
                  <SelectValue placeholder="Выберите..." />
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

        <div className="space-y-1.5">
          <Label>Дедлайн</Label>
          <Input
            type="date"
            aria-invalid={!!errors.deadline}
            className={formFieldErrorClass(!!errors.deadline)}
            {...register('deadline')}
          />
          {errors.deadline && <p className="text-xs text-[var(--destructive)]">{errors.deadline.message}</p>}
        </div>
      </div>

      {activeHabits.length > 0 && (
        <div className="space-y-2">
          <Label>Связанные привычки</Label>
          <div className="max-h-36 space-y-2 overflow-y-auto">
            {activeHabits.map((habit) => (
              <label key={habit.id} className="flex cursor-pointer items-center gap-2.5">
                <Checkbox
                  checked={linkedHabitIds.includes(habit.id)}
                  onCheckedChange={() => toggleHabit(habit.id)}
                />
                <span className="text-sm">
                  {habit.icon} {habit.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

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