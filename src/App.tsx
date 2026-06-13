import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppStoreProvider } from '@/stores/use-app-store'

import Layout from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'

// Operations
import SaldosPage from './pages/operations/SaldosPage'
import EnderecamentoPage from './pages/operations/EnderecamentoPage'
import TransferenciaPage from './pages/operations/TransferenciaPage'
import AjustesPage from './pages/operations/AjustesPage'

// Cadastros
import ProdutosPage from './pages/cadastros/ProdutosPage'

const App = () => (
  <BrowserRouter>
    <AppStoreProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/saldos" element={<SaldosPage />} />
            <Route path="/enderecamento" element={<EnderecamentoPage />} />
            <Route path="/transferencia" element={<TransferenciaPage />} />
            <Route path="/ajustes" element={<AjustesPage />} />
            <Route path="/produtos" element={<ProdutosPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AppStoreProvider>
  </BrowserRouter>
)

export default App
