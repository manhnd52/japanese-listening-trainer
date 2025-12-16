// app/(main)/layout.
import TopHeader from '@/components/layout/TopHeader'
import Sidebar from '@/components/layout/Sidebar'

export default function MainLayout({ children } : { children: React.ReactNode }) {
  return (
    <>
      <TopHeader />
      <Sidebar/>
      <main className="flex pt-16 flex-1 min-h-0 pl-0 md:pl-64">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </>
  )
}