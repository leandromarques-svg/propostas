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
                    dark: '#0F172A',   // Slate 900 - Dark professional background
                    medium: '#4F46E5', // Indigo 600 - Primary action color
                    lime: '#84CC16',   // Lime 500 - Highlight/Accent
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
