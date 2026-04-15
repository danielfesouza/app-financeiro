'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Transaction, Category, TransactionType } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  transaction?: Transaction | null
  onSaved: (transaction: Transaction, isEdit: boolean) => void
  onCancel: () => void
}

export default function TransactionForm({ transaction, onSaved, onCancel }: Props) {
  const isEdit = !!transaction
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'despesa')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '')
  const [date, setDate] = useState(
    transaction?.date ?? new Date().toISOString().split('T')[0]
  )
  const [category, setCategory] = useState<Category>(transaction?.category ?? 'Outros')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount.replace(',', '.'))
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Informe um valor válido maior que zero.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }

      const payload = {
        description: description.trim(),
        amount: parsedAmount,
        date,
        type,
        category,
      }

      if (isEdit && transaction) {
        const { data, error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', transaction.id)
          .select()
          .single()

        if (error) throw error
        toast.success('Transação atualizada!')
        onSaved(data as Transaction, true)
      } else {
        const { data, error } = await supabase
          .from('transactions')
          .insert({ ...payload, user_id: user.id })
          .select()
          .single()

        if (error) throw error
        toast.success('Transação registrada!')
        onSaved(data as Transaction, false)
      }
    } catch {
      toast.error('Erro ao salvar transação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => setType('despesa')}
          className={cn(
            'flex-1 py-2 rounded-md text-sm font-medium transition-all',
            type === 'despesa'
              ? 'bg-white shadow-sm text-red-600 border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => setType('receita')}
          className={cn(
            'flex-1 py-2 rounded-md text-sm font-medium transition-all',
            type === 'receita'
              ? 'bg-white shadow-sm text-green-600 border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Receita
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          placeholder="Ex.: Supermercado, Salário..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={100}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Categoria</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? 'Salvar alterações' : 'Registrar'}
        </Button>
      </div>
    </form>
  )
}
