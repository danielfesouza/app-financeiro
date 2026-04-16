'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Transaction } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  transactions: Transaction[]
  month: number
  year: number
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default function DashboardClient({ transactions, month, year }: Props) {
  const receitas = useMemo(
    () => transactions.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0),
    [transactions]
  )
  const despesas = useMemo(
    () => transactions.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0),
    [transactions]
  )
  const saldo = receitas - despesas

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {}
    transactions
      .filter((t) => t.type === 'despesa')
      .forEach((t) => {
        map[t.category] = (map[t.category] ?? 0) + t.amount
      })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  const recent = transactions.slice(0, 5)

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 pt-16 lg:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {MONTHS[month - 1]} de {year}
          </p>
        </div>
        <Button asChild>
          <Link href="/transactions?new=1">
            <Plus className="w-4 h-4 mr-2" />
            Nova transação
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Receitas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(receitas)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Despesas</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(despesas)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(saldo)}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${saldo >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
                <Wallet className={`w-5 h-5 ${saldo >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie chart */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <PieChart className="w-10 h-10 opacity-30" />
                <p className="text-sm">Nenhuma despesa este mês</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] ?? '#6b7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Valor']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '13px', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent transactions */}
        <Card className="border-border/60">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Transações Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground">
              <Link href="/transactions">
                Ver todas <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Wallet className="w-10 h-10 opacity-30" />
                <p className="text-sm">Nenhuma transação este mês</p>
                <Button size="sm" asChild className="mt-2">
                  <Link href="/transactions?new=1">
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Adicionar
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {recent.map((t, i) => (
                  <div key={t.id}>
                    <div className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? '#6b7280' }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs py-0 px-1.5 h-4 font-normal">
                              {t.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(t.date + 'T00:00:00'), "d MMM", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold shrink-0 ml-3 ${
                          t.type === 'receita' ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {t.type === 'receita' ? '+' : '-'} {formatCurrency(t.amount)}
                      </span>
                    </div>
                    {i < recent.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
