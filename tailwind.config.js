/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                metarh: {
                    dark: '#470082',
                    medium: '#aa3ffe',
                    pink: '#ff27f9',
                    lime: '#c9f545',
                    yellow: '#fff24d',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                barlow: ['Barlow', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
