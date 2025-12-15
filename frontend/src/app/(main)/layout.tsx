import TopHeader from '@/components/layout/TopHeader'
import Sidebar from '@/components/layout/Sidebar'
import DictionaryInitializer from '@/components/provider/DictionaryInitializer'
import MiniPlayer from '@/features/miniplayer/components/MiniPlayer'
import Player from '@/features/player/Player'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopHeader />
      <Sidebar />
      <div className="pl-0 md:pl-64 pb-24 min-h-screen">
        {children}
      </div>
      <MiniPlayer />
      <Player />
      <DictionaryInitializer />
    </>
  )
}
