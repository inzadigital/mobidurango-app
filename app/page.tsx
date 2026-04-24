/**
 * Página inicial de Mobidurango App
 *
 * Esta es la página que verá la gente al entrar en mobidurango.vercel.app
 * Por ahora muestra:
 *   - Logo y tagline
 *   - Enlaces a la web estática y al (futuro) calendario
 *   - Nota de "en desarrollo"
 *
 * Conforme avancemos con las fases, aquí iremos añadiendo:
 *   - Fase B: acceso al calendario completo
 *   - Fase C: acceso al admin
 */
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-mobidurango flex flex-col items-center justify-center p-6 text-white">

      {/* Logo dentro de cápsula blanca */}
      <div className="bg-white rounded-full px-8 py-5 shadow-2xl mb-10 animate-fade-in">
        <Image
          src="/mobidurango-logo.jpg"
          alt="Mobidurango"
          width={280}
          height={100}
          priority
          className="h-16 w-auto"
        />
      </div>

      {/* Título */}
      <h1 className="font-heading text-4xl md:text-6xl uppercase tracking-tight text-center mb-6 max-w-3xl leading-tight animate-fade-in">
        Ongi etorri<br />
        <span className="text-amarillo">aplikaziora</span>
      </h1>

      {/* Subtítulo */}
      <p className="text-lg md:text-xl text-center opacity-90 max-w-2xl mb-12 animate-fade-in">
        Durangoko ohitura osasuntsuen kudeaketa plataforma.
        Egutegia, ekitaldiak eta sarea puntu bakar batean.
      </p>

      {/* Estado actual */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6 max-w-xl text-center mb-10 animate-fade-in">
        <div className="inline-block bg-amarillo text-gris-texto text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
          Garapenean
        </div>
        <h2 className="font-heading text-xl uppercase mb-3">
          Aplikazioa eraikitzen ari gara
        </h2>
        <p className="text-sm opacity-90 leading-relaxed">
          Laster hemen: egutegia, ekitaldi bereziak, erakunde bazkideen
          jarduerak eta kudeaketa panela.
        </p>
      </div>

      {/* Enlace a la web estática del servicio */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
        <a
          href="https://www.durangokirolak.net"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 bg-white text-morado font-heading uppercase text-sm tracking-wide px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-lg"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Zerbitzuaren webera
        </a>
      </div>

      {/* Pie */}
      <footer className="mt-16 text-center text-xs opacity-60">
        <p>© 2026 Mobidurango · Durangoko Udalaren zerbitzua</p>
      </footer>

    </main>
  );
}
