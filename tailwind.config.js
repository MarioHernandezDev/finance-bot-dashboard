/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0D14',      // Fondo ultra oscuro
          surface: '#121824', // Tarjetas / Sidebar
          border: '#1E293B',  // Bordes sutiles
        },
        brand: {
          primary: '#3B82F6', // Azul acento
          bull: '#10B981',    // Verde positivo / Compra
          bear: '#EF4444',    // Rojo negativo / Venta
        }
      }
    }
  }
}