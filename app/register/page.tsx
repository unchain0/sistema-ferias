'use client';

import { Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string): { valid: boolean; message?: string } => {
    if (pwd.length < 6) {
      return { valid: false, message: 'A senha deve ter pelo menos 6 caracteres' };
    }
    if (pwd.length > 72) {
      return { valid: false, message: 'A senha deve ter no máximo 72 caracteres' };
    }
    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message || 'Senha inválida');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao criar conta');
      } else {
        toast.success('Conta criada com sucesso!');
        router.push('/login');
      }
    } catch {
      toast.error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container-auth relative">
      {/* Background illustration - covers full screen */}
      <Image
        src="/vacation-illustration.png"
        alt=""
        fill
        className="object-cover opacity-40 dark:opacity-30 select-none pointer-events-none"
        priority
        suppressHydrationWarning
      />

      <Card className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-6">
          <Calendar className="w-12 h-12 text-blue-600 mb-2" suppressHydrationWarning />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Criar Conta</h1>
          <p className="text-muted mt-1">Cadastre-se no Sistema de Férias</p>
        </div>

        <form onSubmit={handleSubmit} className="form-group">
          <Input
            label="Nome"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            required
          />

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
            maxLength={72}
          />

          <Input
            label="Confirmar Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            maxLength={72}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Faça login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
