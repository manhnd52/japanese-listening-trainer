import TopHeader from '@/components/layout/TopHeader'
import MiniPlayer from '@/features/miniplayer/components/MiniPlayer'
import Player from '@/features/player/Player'
import Sidebar from '@/components/layout/Sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopHeader />
      <main className="flex">
        <Sidebar/>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </main>
      <MiniPlayer />
      <Player />
    </>
  )
}
