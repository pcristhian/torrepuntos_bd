/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",      // Verifica que esté apuntando a la carpeta 'app'
      "./components/**/*.{js,ts,jsx,tsx}",  // Verifica que esté apuntando a la carpeta 'components'
      "./pages/**/*.{js,ts,jsx,tsx}"     // Verifica que esté apuntando a la carpeta 'pages'
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  