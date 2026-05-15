'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/lib/store'
import { formFieldErrorClass } from '@/lib/utils'

const schema = z.object({
  value: z
    .custom<number>(
      (v) => typeof v === 'number' && Number.isFinite(v) && !Number.isNaN(v) && v >= 0,
      { message: 'Введите неотрицательное число' }
    ),
  note: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface AddProgressModalProps {
  goalId: string
  unit?: string
  currentValue: number
}

export function AddProgressModal({ goalId, unit, currentValue }: AddProgressModalProps) {
  const [open, setOpen] = useState(false)
  const { addGoalProgress } = useStore()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { value: currentValue },
  })

  const onSubmit = async (data: FormData) => {
    await addGoalProgress({
      goalId,
      date: new Date(),
      value: data.value,
      note: data.note,
    })
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1.5" /> Добавить прогресс
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Обновить прогресс</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label>Текущее значение {unit ? `(${unit})` : ''}</Label>
            <Input
              type="number"
              min={0}
              step="0.1"
              aria-invalid={!!errors.value}
              className={formFieldErrorClass(!!errors.value)}
              {...register('value', { valueAsNumber: true })}
            />
            {errors.value && <p className="text-xs text-[var(--destructive)]">{errors.value.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Заметка (необязательно)</Label>
            <Textarea placeholder="Например: Пробежал 5 км" {...register('note')} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" className="flex-1">Сохранить</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
