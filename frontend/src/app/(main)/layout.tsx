import TopHeader from '@/components/layout/TopHeader'
import MiniPlayer from '@/features/miniplayer/components/MiniPlayer'

const mockUser = { name: 'John Doe', email: 'john@example.com' }
const mockStat = { streak: 5, level: 3, exp: 45 }

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopHeader />
      <main className="flex-1 p-4">
        {children}
      </main>
      <MiniPlayer />
    </>
  )
}
