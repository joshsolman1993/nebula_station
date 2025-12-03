/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                deepspace: {
                    50: '#e6e7ff',
                    100: '#c4c6ff',
                    200: '#9ea1ff',
                    300: '#787cff',
                    400: '#5c60ff',
                    500: '#4044ff',
                    600: '#3a3ef7',
                    700: '#3235e3',
                    800: '#2a2dd0',
                    900: '#1c1fb0',
                    950: '#0a0a12',
                },
                neon: {
                    cyan: '#00f0ff',
                    magenta: '#ff00ff',
                    amber: '#ffbf00',
                    purple: '#b026ff',
                    blue: '#0080ff',
                }
            },
            fontFamily: {
                orbitron: ['Orbitron', 'sans-serif'],
                rajdhani: ['Rajdhani', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
