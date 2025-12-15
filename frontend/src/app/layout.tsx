import '@/styles/globals.css'
import StoreProvider from '@/components/provider/StoreProvider'
import AuthInitializer from '@/components/provider/AuthInitializer'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-jlt-cream text-black min-h-screen" suppressHydrationWarning>
                <StoreProvider>
                    <AuthInitializer />
                    {children}
                </StoreProvider>
            </body>
        </html>
    )
}
