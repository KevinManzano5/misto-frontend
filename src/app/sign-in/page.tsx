'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import Link from 'next/link';
import axios from 'axios';

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      authService.setToken(response.access_token);
      router.push('/');
    } catch (err: unknown) {
      if (axios.isAxiosError<{ detail: string }>(err)) {
        setError(err.response?.data?.detail || 'Credenciales inválidas');
      } else {
        setError('Ocurrió un error inesperado al intentar iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 font-sans px-4">
      <div className="max-w-md w-full p-8 bg-neutral-900/50 border border-neutral-800 rounded-xl">
        <h2 className="text-2xl font-medium text-center text-white mb-8 tracking-tight">
          Iniciar Sesión
        </h2>

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Iniciando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-400">
          ¿No tienes cuenta?{' '}
          <Link
            href="/sign-up"
            className="text-white hover:text-neutral-300 transition-colors font-medium"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
