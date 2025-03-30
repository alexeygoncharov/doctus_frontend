/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			headerText: '#363748',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'sans-serif'
  			],
  			onest: [
  				'Onest',
  				'sans-serif'
  			]
  		},
  		maxWidth: {
  			'90': '22.5rem',
  			'103': '25.75rem',
  			'110': '27.5rem',
  			'126': '31.5rem',
  			'135': '33.75rem',
  			'154': '38.5rem',
  			'320': '80rem',
  			'64.5': '16.125rem',
  			'105.5': '26.375rem',
  			'190.5': '47.625rem',
  			'227.5': '56.875rem'
  		},
  		minWidth: {
  			'52': '13rem',
  			'37.5': '9.375rem',
  			'8.5': '2.125rem'
  		},
  		spacing: {
  			'15': '3.75rem',
  			'30': '7.5rem',
  			'4.5': '1.125rem',
  			'7.5': '1.875rem',
  			'8.5': '2.125rem',
  			'9.5': '2.375rem',
  			'17.5': '4.375rem'
  		},
  		fontSize: {
  			'5': '1.25rem'
  		},
  		lineHeight: {
  			'4.5': '1.125rem',
  			'7.5': '1.875rem'
  		},
  		borderRadius: {
  			'5': '1.25rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		backgroundImage: {
  			'linear-to-b': 'linear-gradient(to bottom, var(--tw-gradient-stops))'
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: 0
  				}
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}