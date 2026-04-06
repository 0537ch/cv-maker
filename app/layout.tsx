import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { LayoutGroup } from 'framer-motion'

import "./globals.css"
import { cn } from "@/lib/utils"

const geistHeading = Geist({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: 'ATS CV Maker - Create Professional CVs',
  description: 'Build ATS-friendly CVs with real-time preview and instant PDF export',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn("dark antialiased", fontMono.variable, "font-sans", inter.variable, geistHeading.variable)}
    >
      <body className="bg-slate-950">
        <LayoutGroup>
          {children}
        </LayoutGroup>
      </body>
    </html>
  )
}
