/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.ejs', './src/**/*.js', './public/**/*.html', 'node_modules/preline/dist/*.js'],
  theme: {
    extend: {},
  },
  plugins: [
    require('preline/plugin'),
  ],
}