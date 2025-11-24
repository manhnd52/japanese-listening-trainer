/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Nunito', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f4f9f0',
                    100: '#e4efe3', // Sage (Cards)
                    200: '#cce3ca',
                    300: '#a6cfa3',
                    400: '#7db678',
                    500: '#4e7c29', // Olive Primary
                    600: '#3d6320',
                    700: '#304d1a',
                    900: '#1a3c1e', // Dark Forest Text
                },
                jlt: {
                    cream: '#fcfdf7',
                    sage: '#e4efe3',
                    peach: '#f5dcb8',
                    dark: '#1a3c1e',
                    gray: '#6b7c6b'
                },
                slate: {
                    50: '#fcfdf7', // Mapping slate-50 to cream
                    100: '#f4f9f0',
                    200: '#e4efe3',
                    300: '#cce3ca',
                    400: '#9ab09a',
                    500: '#6b7c6b',
                    600: '#4e7c29',
                    700: '#3d6320',
                    800: '#304d1a', // Dark green cards if needed
                    900: '#1a3c1e', // Deep forest
                }
            }
        }
    },
    plugins: [],
}
