'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { useStore } from '@/lib/store'
import type { Category } from '@/lib/types'
import { formFieldErrorClass, cn } from '@/lib/utils'

const profileSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
})
type ProfileForm = z.infer<typeof profileSchema>

const newCategorySchema = z.object({
  name: z.string().min(1, 'Введите название').max(40, 'Не длиннее 40 символов'),
  icon: z.string().min(1, 'Укажите эмодзи-иконку').max(4),
})

export default function SettingsPage() {
  const { user, updateUser, categories, addCategory, updateCategory, deleteCategory } = useStore()
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('📌')
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editNameError, setEditNameError] = useState<string | null>(null)
  const [newCatErrors, setNewCatErrors] = useState<{ name?: string; icon?: string }>({})

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: { name: user.name, email: user.email },
  })

  useEffect(() => {
    resetProfile({ name: user.name, email: user.email })
  }, [user.name, user.email, resetProfile])

  const onProfileSave = (data: ProfileForm) => {
    updateUser({ name: data.name, email: data.email })
  }

  const handleAddCategory = () => {
    setNewCatErrors({})
    const parsed = newCategorySchema.safeParse({ name: newCatName.trim(), icon: newCatIcon.trim() || '📌' })
    if (!parsed.success) {
      const e: { name?: string; icon?: string } = {}
      for (const issue of parsed.error.issues) {
        const k = issue.path[0]
        if (k === 'name' || k === 'icon') e[k] = issue.message
      }
      setNewCatErrors(e)
      return
    }
    addCategory({
      name: parsed.data.name,
      icon: parsed.data.icon,
      color: '#6366f1',
    })
    setNewCatName('')
    setNewCatIcon('📌')
  }

  const handleSaveEdit = (cat: Category) => {
    setEditNameError(null)
    const r = z.string().min(1, 'Название не может быть пустым').max(40).safeParse(editName.trim())
    if (!r.success) {
      setEditNameError(r.error.issues[0]?.message ?? 'Ошибка')
      return
    }
    updateCategory(cat.id, { name: r.data })
    setEditingCatId(null)
  }

  return (
    <AppLayout title="Настройки">
      <div className="max-w-2xl space-y-6">

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Профиль</CardTitle>
            <CardDescription>Ваши личные данные</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-4" noValidate>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <Button type="button" variant="outline" size="sm">Загрузить фото</Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="settings-name">Имя</Label>
                <Input
                  id="settings-name"
                  aria-invalid={!!profileErrors.name}
                  className={formFieldErrorClass(!!profileErrors.name)}
                  {...registerProfile('name')}
                />
                {profileErrors.name && (
                  <p className="text-xs text-[var(--destructive)]">{profileErrors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  id="settings-email"
                  type="email"
                  aria-invalid={!!profileErrors.email}
                  className={formFieldErrorClass(!!profileErrors.email)}
                  {...registerProfile('email')}
                />
                {profileErrors.email && (
                  <p className="text-xs text-[var(--destructive)]">{profileErrors.email.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto">Сохранить профиль</Button>
            </form>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Уведомления</CardTitle>
            <CardDescription>Настройте напоминания о привычках</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Ежедневные напоминания</p>
                <p className="text-xs text-[var(--muted-foreground)]">Получать напоминания в указанное время</p>
              </div>
              <Switch
                checked={user.remindersEnabled}
                onCheckedChange={(checked) => updateUser({ remindersEnabled: checked })}
              />
            </div>
            {user.remindersEnabled && (
              <div className="space-y-1.5">
                <Label>Время напоминания</Label>
                <Input
                  type="time"
                  defaultValue={user.reminderTime ?? '09:00'}
                  onBlur={(e) => updateUser({ reminderTime: e.target.value })}
                  className="w-36"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Telegram */}
        <Card>
          <CardHeader>
            <CardTitle>Telegram-бот</CardTitle>
            <CardDescription>Получайте напоминания в Telegram</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.telegramConnected ? (
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-sm font-medium text-green-800">Telegram подключён</p>
                    {user.telegramUsername && (
                      <p className="text-xs text-green-600">@{user.telegramUsername}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateUser({ telegramConnected: false })}
                >
                  Отключить
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 p-4 space-y-2">
                  <p className="text-sm font-medium">Как подключить бота:</p>
                  <ol className="text-sm text-[var(--muted-foreground)] space-y-1 list-decimal ml-4">
                    <li>Откройте Telegram и найдите <strong>@HabitFlowBot</strong></li>
                    <li>Нажмите <strong>Start</strong> или отправьте команду <code className="bg-[var(--muted)] px-1 rounded">/start</code></li>
                    <li>Перейдите по ссылке или скопируйте код авторизации</li>
                  </ol>
                </div>
                <Button onClick={() => updateUser({ telegramConnected: true, telegramUsername: 'user' })}>
                  Подключить Telegram
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Категории</CardTitle>
            <CardDescription>Управляйте категориями привычек и целей</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {categories.length === 0 ? (
                <EmptyState
                  icon="📂"
                  title="Категорий пока нет"
                  description="Добавьте категорию ниже — они используются для привычек и целей."
                  compact
                  className="py-6"
                />
              ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3">
                  <span className="text-xl">{cat.icon}</span>
                  {editingCatId === cat.id ? (
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => {
                            setEditName(e.target.value)
                            setEditNameError(null)
                          }}
                          className={cn('h-7 min-w-0 flex-1 text-sm', formFieldErrorClass(!!editNameError))}
                        />
                        <Button size="sm" type="button" onClick={() => handleSaveEdit(cat)}>
                          Сохранить
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setEditingCatId(null)
                            setEditNameError(null)
                          }}
                        >
                          Отмена
                        </Button>
                      </div>
                      {editNameError && (
                        <p className="text-xs text-[var(--destructive)]">{editNameError}</p>
                      )}
                    </div>
                  ) : (
                    <>
                      <span
                        className="flex-1 text-sm font-medium px-2 py-0.5 rounded-full text-xs"
                        style={{ backgroundColor: cat.color + '20', color: cat.color }}
                      >
                        {cat.name}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingCatId(cat.id)
                          setEditName(cat.name)
                          setEditNameError(null)
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-[var(--destructive)]"
                        onClick={() => setDeleteDialogId(cat.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              ))
              )}
            </div>
            {/* Add category */}
            <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Название категории"
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value)
                  setNewCatErrors((p) => ({ ...p, name: undefined }))
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                aria-invalid={!!newCatErrors.name}
                className={cn('min-w-[12rem] flex-1', formFieldErrorClass(!!newCatErrors.name))}
              />
              <Input
                placeholder="🏷️"
                value={newCatIcon}
                onChange={(e) => {
                  setNewCatIcon(e.target.value)
                  setNewCatErrors((p) => ({ ...p, icon: undefined }))
                }}
                className={cn('w-20', formFieldErrorClass(!!newCatErrors.icon))}
              />
              <Button type="button" onClick={handleAddCategory}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {(newCatErrors.name || newCatErrors.icon) && (
              <p className="text-xs text-[var(--destructive)]">
                {[newCatErrors.name, newCatErrors.icon].filter(Boolean).join(' · ')}
              </p>
            )}
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle>Оформление</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateUser({ theme: t })}
                  className={`flex-1 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                    user.theme === t
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'border-[var(--border)] hover:bg-[var(--accent)]'
                  }`}
                >
                  {t === 'light' ? '☀️ Светлая' : t === 'dark' ? '🌙 Тёмная' : '💻 Системная'}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Опасная зона</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Выйти из аккаунта</p>
                <p className="text-xs text-[var(--muted-foreground)]">Вы выйдете на всех устройствах</p>
              </div>
              <Button variant="outline" size="sm">Выйти</Button>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
              <div>
                <p className="text-sm font-medium text-red-600">Удалить аккаунт</p>
                <p className="text-xs text-[var(--muted-foreground)]">Все данные будут удалены безвозвратно</p>
              </div>
              <Button variant="destructive" size="sm">Удалить</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteDialogId}
        onOpenChange={(open) => !open && setDeleteDialogId(null)}
        title="Удалить категорию?"
        description="Привычки с этой категорией не будут удалены."
        confirmLabel="Удалить"
        destructive
        onConfirm={() => {
          if (deleteDialogId) deleteCategory(deleteDialogId)
          setDeleteDialogId(null)
        }}
      />
    </AppLayout>
  )
}
