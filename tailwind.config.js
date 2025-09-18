/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
	  "./resources/**/*.blade.php",
	  "./resources/**/*.js",
	  "./resources/**/*.jsx",
	  "./resources/**/*.vue",
	  "./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
	  extend: {
		fontFamily: {
		  poppins: ["Poppins", "sans-serif"], // Custom font na "Poppins"
		},
	  },
	},
	plugins: [],
  };
  