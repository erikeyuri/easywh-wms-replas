import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Boxes } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast({
        title: 'Erro de Autenticação',
        description: 'Credenciais inválidas.',
        variant: 'destructive',
      })
    } else {
      navigate('/')
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Boxes className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo ao EasyWH</h1>
          <p className="text-sm text-muted-foreground">Insira suas credenciais para acessar.</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="grid gap-4">
            <div className="grid gap-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button disabled={loading} type="submit" className="w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
