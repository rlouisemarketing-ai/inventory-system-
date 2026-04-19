import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata = {
  title: 'Growing in Grace',
  description: 'Connect, reflect, and grow.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-sage-50 text-neutral-900">
        <div className="min-h-screen pb-20">
          {children}
        </div>
        <NavBar />
      </body>
    </html>
  )
}
