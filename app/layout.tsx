import type { Metadata } from 'next'
import { Inter, Bodoni_Moda, JetBrains_Mono, VT323, ZCOOL_KuaiLe } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const vt323 = VT323({
  subsets: ['latin'],
  variable: '--font-pixel',
  weight: '400',
  display: 'swap',
})

const zcoolKuaiLe = ZCOOL_KuaiLe({
  subsets: ['latin'],
  variable: '--font-handwrite',
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Life Design Lab | 斯坦福人生设计课',
  description: 'Design your life with Stanford Life Design tools - Odyssey Plan, Good Time Journal, and Life Dashboard',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${bodoniModa.variable} ${jetbrainsMono.variable} ${vt323.variable} ${zcoolKuaiLe.variable} font-sans antialiased bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
