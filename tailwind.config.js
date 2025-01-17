/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        Fleur: ["Dynalight", 'serif'], 
        Funnel: ["Funnel Display", 'serif'],
        Birthstone: ["Birthstone", 'serif']
      },
    },
    container: {
      center: true,
      padding: '0',
      screens: {
        sm: '600px', 
        md: '800px',  
        lg: '1000px', 
        xl: '1200px', 
      },
    }
  },
  plugins: [],
}

