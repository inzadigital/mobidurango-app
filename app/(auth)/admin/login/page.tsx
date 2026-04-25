'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setErrorMsg('Emaila edo pasahitza okerra da. Saiatu berriro.');
      setCargando(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gradient-mobidurango flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full px-6 py-3 border-2 border-morado-claro">
            <Image
              src="/mobidurango-logo.jpg"
              alt="Mobidurango"
              width={200}
              height={60}
              priority
              className="h-12 w-auto"
            />
          </div>
        </div>

        <h1 className="font-heading text-2xl text-morado text-center mb-2 uppercase tracking-tight">
          Administrazio eremua
        </h1>
        <p className="text-sm text-gris-suave text-center mb-8">
          Sartu zure kontuarekin Mobidurango kudeatzeko
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gris-texto mb-2">
              Emaila
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gris-medio rounded-lg focus:ring-2 focus:ring-morado focus:border-morado transition-colors"
              placeholder="zure@emaila.eus"
              disabled={cargando}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gris-texto mb-2">
              Pasahitza
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gris-medio rounded-lg focus:ring-2 focus:ring-morado focus:border-morado transition-colors"
              placeholder="••••••••"
              disabled={cargando}
            />
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando || !email || !password}
            className="w-full bg-morado hover:bg-morado-oscuro disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading uppercase tracking-wide py-3 rounded-lg transition-colors"
          >
            {cargando ? 'Sartzen...' : 'Sartu'}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gris-medio">
          
            href="/"
            className="text-sm text-gris-suave hover:text-morado transition-colors"
          >
            ← Itzuli hasierara
          </a>
        </div>

      </div>
    </main>
  );
}
