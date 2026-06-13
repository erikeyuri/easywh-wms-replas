import { Link, useLocation } from 'react-router-dom'
import { Bell, ChevronRight, User } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const routeNames: Record<string, string> = {
  '': 'Dashboard',
  empresas: 'Empresas e Filiais',
  armazens: 'Armazéns',
  zonas: 'Zonas',
  enderecos: 'Endereços',
  produtos: 'Produtos',
  operadores: 'Operadores',
  saldos: 'Consulta de Saldos',
  enderecamento: 'Endereçamento',
  transferencias: 'Transferências',
}

export function AppHeader() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const pathnames = location.pathname.split('/').filter((x) => x)
  const isHome = pathnames.length === 0

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-subtle">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2" />
        <div className="hidden sm:block">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                {isHome ? (
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to="/">Dashboard</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isHome &&
                pathnames.map((value, index) => {
                  const isLast = index === pathnames.length - 1
                  const title = routeNames[value] || value
                  return (
                    <div key={value} className="flex items-center gap-2">
                      <BreadcrumbSeparator>
                        <ChevronRight className="w-4 h-4" />
                      </BreadcrumbSeparator>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={`/${pathnames.slice(0, index + 1).join('/')}`}>{title}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  )
                })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-secondary hover:text-primary">
          <Bell className="w-5 h-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              className="text-destructive focus:bg-destructive/10"
            >
              Sair do Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
