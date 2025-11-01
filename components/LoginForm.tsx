'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('❌ Email ou senha incorretos');
      } else {
        toast.success('✅ Login realizado com sucesso!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('❌ Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);

    try {
      await fetch('/api/auth/init-demo', { method: 'POST' });
      const result = await signIn('credentials', {
        email: 'demo@sistema-ferias.com',
        password: 'demo123',
        redirect: false,
      });

      if (result?.error) {
        toast.error('❌ Erro ao acessar demonstração');
      } else {
        toast.success('✅ Acesso demo liberado!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('❌ Erro ao acessar demonstração');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
        />

        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          maxLength={100}
        />

        <Button type="submit" className="w-full" disabled={loading || demoLoading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              ou
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full mt-4 flex items-center justify-center"
          onClick={handleDemoLogin}
          disabled={loading || demoLoading}
        >
          <Eye className="w-5 h-5 mr-2" />
          {demoLoading ? 'Carregando demonstração...' : 'Acessar Demonstração'}
        </Button>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
          Explore o sistema com dados de exemplo (somente visualização)
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?{' '}
          <Link prefetch={false} href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            Cadastre-se
          </Link>
        </p>
      </div>
    </>
  );
}
