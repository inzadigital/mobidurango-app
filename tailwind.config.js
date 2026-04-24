/**
 * Configuración de Tailwind CSS para Mobidurango
 *
 * Aquí están los colores oficiales de Mobidurango,
 * extraídos del logo real y validados para accesibilidad WCAG AA.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Mobidurango (misma que la web estática)
        morado: {
          DEFAULT: '#6B2EBF',  // Color protagonista
          oscuro: '#4A1F8A',   // Hover, gradientes
          claro: '#EEE4FA',    // Fondos suaves
        },
        violeta: '#7B42E0',
        'azul-cielo': '#49D7FF',  // Acento del degradado del logo
        amarillo: '#FFD500',      // Acento alegre, CTAs
        gris: {
          texto: '#2A2A2A',
          suave: '#666666',
          claro: '#F5F5F5',
          medio: '#E5E5E5',
          oscuro: '#4A4A4A',
          footer: '#1F1F1F',
          institucional: '#1A1A2E',
        },
      },
      fontFamily: {
        // Tipografías iguales que la web estática
        heading: ['"Archivo Black"', 'sans-serif'],
        body: ['Inter', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        // Gradiente principal del logo (morado → azul cielo)
        'gradient-mobidurango': 'linear-gradient(135deg, #4A1F8A 0%, #6B2EBF 50%, #49D7FF 120%)',
        'gradient-morado': 'linear-gradient(135deg, #6B2EBF 0%, #4A1F8A 100%)',
      },
    },
  },
  plugins: [],
};
