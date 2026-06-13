import { Link, useLocation } from 'react-router-dom'
import {
  Building2,
  Home,
  Layers,
  MapPin,
  Package,
  Warehouse,
  Boxes,
  Users,
  BarChart3,
  FileEdit,
  ArrowDownToLine,
  ArrowRightLeft,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navItems = [
  { title: 'Dashboard', url: '/', icon: Home, group: 'Visão Geral' },
  { title: 'Empresas e Filiais', url: '/empresas', icon: Building2, group: 'Estrutura' },
  { title: 'Armazéns', url: '/armazens', icon: Warehouse, group: 'Estrutura' },
  { title: 'Zonas', url: '/zonas', icon: Layers, group: 'Estrutura' },
  { title: 'Endereços', url: '/enderecos', icon: MapPin, group: 'Estrutura' },
  { title: 'Produtos', url: '/produtos', icon: Package, group: 'Cadastros' },
  { title: 'Operadores', url: '/operadores', icon: Users, group: 'Cadastros' },
  { title: 'Saldos em Estoque', url: '/saldos', icon: BarChart3, group: 'Consultas' },
  { title: 'Manutenção de Saldos', url: '/manutencao-saldos', icon: FileEdit, group: 'Operações' },
  { title: 'Endereçamento', url: '/enderecamento', icon: ArrowDownToLine, group: 'Operações' },
  { title: 'Transferências', url: '/transferencias', icon: ArrowRightLeft, group: 'Operações' },
]

export function AppSidebar() {
  const location = useLocation()
  const groups = Array.from(new Set(navItems.map((i) => i.group)))

  return (
    <Sidebar className="border-r shadow-sm">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border/50">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-sidebar-foreground">
          <Boxes className="w-6 h-6" />
          <span>EasyWH</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems
                  .filter((i) => i.group === group)
                  .map((item) => {
                    const isActive = location.pathname === item.url
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                          <Link to={item.url}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
