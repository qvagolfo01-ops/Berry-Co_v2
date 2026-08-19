import './globals.css'
import Navbar from '../components/ui/navbar'
import Footer from '../components/ui/footer'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="min-h-screen flex flex-col bg-background text-dark">
                <Navbar />
                <main className="flex-1 flex flex-col">{children}</main>
                <Footer />
            </body>
        </html>
    )
}