import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

import Login from './pages/Login'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import EmpresasPage from './pages/Empresas'
import ArmazensPage from './pages/Armazens'
import ZonasPage from './pages/Zonas'
import EnderecosPage from './pages/Enderecos'
import ProdutosPage from './pages/Produtos'
import OperatorsPage from './pages/Operators'
import BalancesPage from './pages/Balances'
import BalanceMaintenancePage from './pages/BalanceMaintenance'
import PutawayPage from './pages/Putaway'
import TransfersPage from './pages/Transfers'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/empresas" element={<EmpresasPage />} />
            <Route path="/armazens" element={<ArmazensPage />} />
            <Route path="/zonas" element={<ZonasPage />} />
            <Route path="/enderecos" element={<EnderecosPage />} />
            <Route path="/produtos" element={<ProdutosPage />} />
            <Route path="/operadores" element={<OperatorsPage />} />
            <Route path="/saldos" element={<BalancesPage />} />
            <Route path="/manutencao-saldos" element={<BalanceMaintenancePage />} />
            <Route path="/enderecamento" element={<PutawayPage />} />
            <Route path="/transferencias" element={<TransfersPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
