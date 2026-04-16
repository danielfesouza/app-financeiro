'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  Search,
  Download,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import type { Transaction, Category } from '@/lib/types'
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import TransactionForm from '@/components/transaction-form'

interface Props {
  transactions: Transaction[]
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

export default function TransactionsClient({ transactions: initialTransactions }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [transactions, setTransactions] = useState(initialTransactions)
  const [search, setSearch] = useState('')
  const [filterMonth, setFilterMonth] = useState(String(new Date().getMonth() + 1))
  const [filterYear, setFilterYear] = useState(String(currentYear))
  const [filterCategory, setFilterCategory] = useState<Category | 'Todas'>('Todas')
  const [filterType, setFilterType] = useState<'all' | 'receita' | 'despesa'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Open form if ?new=1 in URL
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowForm(true)
    }
  }, [searchParams])

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const [tYear, tMonth] = t.date.split('-')
      if (tMonth !== filterMonth.padStart(2, '0')) return false
      if (tYear !== filterYear) return false
      if (filterCategory !== 'Todas' && t.category !== filterCategory) return false
      if (filterType !== 'all' && t.type !== filterType) return false
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [transactions, filterMonth, filterYear, filterCategory, filterType, search])

  const totals = useMemo(() => {
    const receitas = filtered.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0)
    const despesas = filtered.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0)
    return { receitas, despesas, saldo: receitas - despesas }
  }, [filtered])

  const handleSaved = useCallback((tx: Transaction, isEdit: boolean) => {
    setTransactions((prev) =>
      isEdit ? prev.map((t) => (t.id === tx.id ? tx : t)) : [tx, ...prev]
    )
    setShowForm(false)
    setEditingTransaction(null)
    router.replace('/transactions')
  }, [router])

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir transação.')
      return
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    toast.success('Transação excluída.')
    setDeletingId(null)
  }

  function exportCSV() {
    const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor']
    const rows = filtered.map((t) => [
      format(new Date(t.date + 'T00:00:00'), 'dd/MM/yyyy'),
      t.description,
      t.type === 'receita' ? 'Receita' : 'Despesa',
      t.category,
      t.amount.toFixed(2).replace('.', ','),
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financas_${filterYear}_${filterMonth.padStart(2, '0')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportado com sucesso!')
  }

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 pt-16 lg:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transações</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {filtered.length} transação{filtered.length !== 1 ? 'ões' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button size="sm" onClick={() => { setEditingTransaction(null); setShowForm(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Nova transação
          </Button>
        </div>
      </div>

      {/* Summary mini-cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground mb-0.5">Receitas</p>
          <p className="text-base sm:text-lg font-bold text-green-600">{formatCurrency(totals.receitas)}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground mb-0.5">Despesas</p>
          <p className="text-base sm:text-lg font-bold text-red-500">{formatCurrency(totals.despesas)}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground mb-0.5">Saldo</p>
          <p className={`text-base sm:text-lg font-bold ${totals.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(totals.saldo)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterCategory}
            onValueChange={(v) => setFilterCategory(v as Category | 'Todas')}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas categorias</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v as 'all' | 'receita' | 'despesa')}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative col-span-2 sm:col-span-4 lg:col-span-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <ArrowUpDown className="w-10 h-10 opacity-30" />
            <p className="text-sm">Nenhuma transação encontrada</p>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Adicionar transação
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (CATEGORY_COLORS[t.category] ?? '#6b7280') + '20' }}
                  >
                    {t.type === 'receita'
                      ? <TrendingUp className="w-4 h-4 text-green-600" />
                      : <TrendingDown className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs py-0 px-1.5 h-4 font-normal"
                        style={{ borderColor: CATEGORY_COLORS[t.category] + '60', color: CATEGORY_COLORS[t.category] }}
                      >
                        {t.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(t.date + 'T00:00:00'), "d 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  <span className={`text-sm font-semibold ${t.type === 'receita' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'receita' ? '+' : '-'} {formatCurrency(t.amount)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingTransaction(t); setShowForm(true) }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(t.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open)
        if (!open) {
          setEditingTransaction(null)
          router.replace('/transactions')
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            transaction={editingTransaction}
            onSaved={handleSaved}
            onCancel={() => {
              setShowForm(false)
              setEditingTransaction(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será excluída permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
