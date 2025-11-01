import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { rateLimit, getClientIdentifier, createRateLimitResponse } from '@/lib/rate-limit';
import { emailSchema, passwordSchema, nameSchema, sanitizeString } from '@/lib/input-validation';

export async function POST(request: Request) {
  // Rate limiting: 5 registrations per 15 minutes per IP
  const identifier = getClientIdentifier(request);
  const allowed = rateLimit(`register:${identifier}`, {
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  });

  if (!allowed) {
    return createRateLimitResponse(15 * 60 * 1000);
  }

  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate inputs
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validação de comprimento da senha
    if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
      console.error('Invalid password length:', password?.length);
      return NextResponse.json(
        { error: 'A senha deve ter entre 6 e 72 caracteres' },
        { status: 400 }
      );
    }

    // Validação de força da senha
    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      console.error('Password validation failed:', passwordValidation.error);
      return NextResponse.json(
        { error: 'A senha não atende aos requisitos mínimos de segurança' },
        { status: 400 }
      );
    }

    // Validate and sanitize name
    const nameValidation = nameSchema.safeParse(name);
    if (!nameValidation.success) {
      return NextResponse.json(
        { error: 'Nome deve ter entre 2 e 100 caracteres' },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeString(name);

    const user = await registerUser(email, password, sanitizedName);

    if (!user) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
