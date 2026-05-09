'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useStore } from '@/lib/store'
import type { Category } from '@/lib/types'

export default function SettingsPage() {
  const { user, updateUser, categories, addCategory, updateCategory, deleteCategory } = useStore()
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('📌')
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAddCategory = () => {
    if (!newCatName.trim()) return
    addCategory({
      name: newCatName.trim(),
      icon: newCatIcon,
      color: '#6366f1',
    })
    setNewCatName('')
    setNewCatIcon('📌')
  }

  const handleSaveEdit = (cat: Category) => {
    updateCategory(cat.id, { name: editName })
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
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <Button variant="outline" size="sm">Загрузить фото</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Имя</Label>
                <Input
                  defaultValue={user.name}
                  onBlur={(e) => updateUser({ name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  defaultValue={user.email}
                  onBlur={(e) => updateUser({ email: e.target.value })}
                />
              </div>
            </div>
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
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3">
                  <span className="text-xl">{cat.icon}</span>
                  {editingCatId === cat.id ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 h-7 text-sm"
                      />
                      <Button size="sm" onClick={() => handleSaveEdit(cat)}>Сохранить</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCatId(null)}>Отмена</Button>
                    </>
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
                        onClick={() => { setEditingCatId(cat.id); setEditName(cat.name) }}
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
              ))}
            </div>
            {/* Add category */}
            <div className="flex gap-2">
              <Input
                placeholder="Название категории"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Input
                placeholder="🏷️"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                className="w-20"
              />
              <Button onClick={handleAddCategory} disabled={!newCatName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
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
