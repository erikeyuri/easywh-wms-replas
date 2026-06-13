import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '@/stores/use-app-store'
import {
  Warehouse,
  LayoutDashboard,
  Search,
  ArrowRightLeft,
  PackagePlus,
  ClipboardList,
  Settings,
  UserCircle,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ContextSwitcher } from './ContextSwitcher'

export default function Layout() {
  const { role, setRole, activeWarehouse } = useAppStore()
  const location = useLocation()
  const isOperator = role === 'operator'

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, adminOnly: true },
    { name: 'Saldos', href: '/saldos', icon: Search },
    { name: 'Endereçamento', href: '/enderecamento', icon: PackagePlus },
    { name: 'Transferência', href: '/transferencia', icon: ArrowRightLeft },
    { name: 'Ajustes', href: '/ajustes', icon: ClipboardList, adminOnly: true },
    { name: 'Produtos', href: '/produtos', icon: Settings, adminOnly: true },
  ]

  const filteredNav = navigation.filter((item) => !item.adminOnly || !isOperator)

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar - Desktop Admin */}
      {!isOperator && (
        <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar">
          <div className="p-4 border-b flex items-center gap-2 text-primary font-bold text-xl">
            <Warehouse className="w-6 h-6" /> EasyWH
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {filteredNav.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            {isOperator && (
              <div className="flex items-center gap-2 text-primary font-bold text-xl md:hidden">
                <Warehouse className="w-6 h-6" /> EasyWH
              </div>
            )}
            <div className="hidden sm:block text-sm text-muted-foreground">
              {activeWarehouse ? (
                <span className="font-medium text-foreground">
                  Ambiente: {activeWarehouse.name}
                </span>
              ) : (
                'Nenhum armazém selecionado'
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRole(isOperator ? 'admin' : 'operator')}
            >
              <UserCircle className="w-4 h-4 mr-2" />
              {isOperator ? 'Modo Admin' : 'Modo Operador'}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8 pb-24 md:pb-8">
          {!activeWarehouse && location.pathname !== '/' ? (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6 animate-fade-in">
              <Warehouse className="w-16 h-16 text-muted-foreground" />
              <h2 className="text-2xl font-bold">Selecione seu Contexto</h2>
              <p className="text-muted-foreground">
                Para iniciar as operações, defina a filial e o armazém onde você está trabalhando.
              </p>
              <ContextSwitcher />
            </div>
          ) : (
            <Outlet />
          )}
        </main>

        {/* Bottom Nav - Mobile Operator */}
        {isOperator && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card h-16 flex items-center justify-around px-2 z-20 pb-safe">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                    isActive ? 'text-primary font-medium' : 'text-muted-foreground',
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-[10px] uppercase tracking-wider">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </div>
  )
}
