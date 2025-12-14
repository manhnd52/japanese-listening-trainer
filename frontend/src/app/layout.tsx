import '@/styles/globals.css'
import StoreProvider from '@/components/provider/StoreProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-brand-700 text-white flex flex-col min-h-screen" suppressHydrationWarning>
                <StoreProvider>
                    {children}
                </StoreProvider>
            </body>
        </html>
    )
}
