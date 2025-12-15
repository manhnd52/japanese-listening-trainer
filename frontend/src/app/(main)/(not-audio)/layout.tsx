// app/(main)/layout.
import TopHeader from '@/components/layout/TopHeader'
import Sidebar from '@/components/layout/Sidebar'

export default function MainLayout({ children } : { children: React.ReactNode }) {
  return (
    <>
      <TopHeader />
      <main className="flex pt-16 flex-1 min-h-0">
        <Sidebar className="shrink-0"/>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </main>
    </>
  )
}