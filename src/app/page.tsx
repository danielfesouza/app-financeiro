import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  PieChart,
  ShieldCheck,
  Download,
  BarChart3,
  Smartphone,
} from 'lucide-react'

const features = [
  {
    icon: TrendingUp,
    title: 'Dashboard Inteligente',
    description:
      'Visualize receitas, despesas e saldo em tempo real com cards e gráficos interativos.',
  },
  {
    icon: PieChart,
    title: 'Gráficos por Categoria',
    description:
      'Entenda para onde vai seu dinheiro com gráficos de pizza por categoria.',
  },
  {
    icon: ShieldCheck,
    title: 'Dados Seguros',
    description:
      'Autenticação robusta com Supabase. Seus dados são criptografados e privados.',
  },
  {
    icon: Download,
    title: 'Exportar CSV',
    description:
      'Exporte suas transações filtradas em .csv para análise em qualquer planilha.',
  },
  {
    icon: BarChart3,
    title: 'Filtros Avançados',
    description:
      'Filtre por mês, ano, categoria ou busque por descrição em segundos.',
  },
  {
    icon: Smartphone,
    title: '100% Responsivo',
    description:
      'Acesse do celular, tablet ou desktop com a mesma experiência fluida.',
  },
]

const stats = [
  { value: 'R$ 0 →', label: 'Controle financeiro' },
  { value: '9', label: 'Categorias disponíveis' },
  { value: '∞', label: 'Transações registradas' },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">FinançasPessoais</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Criar conta grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32 bg-gradient-to-b from-blue-50/60 to-white">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Controle financeiro pessoal simplificado
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight mb-6">
            Suas finanças em{' '}
            <span className="text-primary">ordem</span>,{' '}
            do jeito certo
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Registre receitas e despesas, acompanhe seu saldo e visualize tudo em
            um dashboard moderno. Simples, seguro e gratuito.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="text-base h-12 px-8">
              <Link href="/signup">Começar gratuitamente</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base h-12 px-8">
              <Link href="/login">Já tenho uma conta</Link>
            </Button>
          </div>
        </div>

        {/* Mock Dashboard Preview */}
        <div className="mt-16 w-full max-w-4xl mx-auto rounded-2xl border border-border shadow-2xl shadow-blue-100/60 overflow-hidden bg-white">
          <div className="bg-gray-50 border-b border-border px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-muted-foreground font-mono">
                financaspessoais.vercel.app/dashboard
              </span>
            </div>
          </div>
          <div className="p-6 bg-gray-50/50">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Receitas', value: 'R$ 5.200,00', color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Despesas', value: 'R$ 3.450,00', color: 'text-red-500', bg: 'bg-red-50' },
                { label: 'Saldo', value: 'R$ 1.750,00', color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map((card) => (
                <div key={card.label} className={`rounded-xl border border-border bg-white p-4 text-left`}>
                  <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                  <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3 rounded-xl border border-border bg-white p-4">
                <p className="text-xs text-muted-foreground mb-3">Transações recentes</p>
                <div className="space-y-3">
                  {[
                    { desc: 'Supermercado', cat: 'Alimentação', val: '- R$ 280', color: 'text-red-500' },
                    { desc: 'Salário', cat: 'Salário', val: '+ R$ 4.000', color: 'text-green-600' },
                    { desc: 'Uber', cat: 'Transporte', val: '- R$ 35', color: 'text-red-500' },
                  ].map((t) => (
                    <div key={t.desc} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{t.desc}</p>
                        <p className="text-xs text-muted-foreground">{t.cat}</p>
                      </div>
                      <span className={`font-semibold ${t.color}`}>{t.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 rounded-xl border border-border bg-white p-4 flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground mb-2">Por categoria</p>
                <div className="w-20 h-20 rounded-full border-8 border-blue-200 border-t-blue-500 border-r-green-400" />
                <div className="mt-3 space-y-1.5 w-full">
                  {[
                    { label: 'Alimentação', color: 'bg-orange-400' },
                    { label: 'Transporte', color: 'bg-blue-500' },
                    { label: 'Salário', color: 'bg-green-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-gray-50/50 py-12">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-primary mb-1">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para controlar suas finanças
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Um app completo, simples e visual. Sem complicação.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Pronto para ter controle das suas finanças?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Crie sua conta gratuita em menos de 1 minuto e comece a registrar suas transações hoje.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-base h-12 px-10 font-semibold">
            <Link href="/signup">Criar conta grátis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-gray-700">FinançasPessoais</span>
        </div>
        <p>© {new Date().getFullYear()} FinançasPessoais. Feito com Next.js + Supabase.</p>
      </footer>
    </div>
  )
}
