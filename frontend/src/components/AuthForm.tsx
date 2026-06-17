import React, { useState } from 'react';

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<unknown>;
  onRegister: (email: string, password: string, name?: string) => Promise<unknown>;
  onSwitchMode?: () => void;
  errorMessage?: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister, errorMessage }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, name || undefined);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Erro ao processar formulário');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Seu nome"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Senha segura"
          />
        </div>

        {(formError || errorMessage) && (
          <p className="text-sm text-red-600">{formError || errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Enviando...' : mode === 'login' ? 'Entrar' : 'Registrar'}
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-600">
        {mode === 'login' ? 'Ainda não tem conta?' : 'Já possui conta?'}
        <button
          type="button"
          className="ml-2 text-blue-600 underline"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setFormError(null);
          }}
        >
          {mode === 'login' ? 'Criar conta' : 'Entrar'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
