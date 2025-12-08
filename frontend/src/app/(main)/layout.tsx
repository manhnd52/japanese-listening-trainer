import TopHeader from '@/components/layout/TopHeader'
import MiniPlayer from '@/features/miniplayer/components/MiniPlayer'
import Player from '@/features/player/Player'


export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopHeader />
      <main className="flex-1 p-4">
        {children}
      </main>
      <MiniPlayer />
      <Player />
    </>
  )
}
