import DictionaryInitializer from '@/components/provider/DictionaryInitializer'
import MiniPlayer from '@/features/miniplayer/components/MiniPlayer'
import Player from '@/features/player/Player'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pl-0 md:pl-32 pb-24 min-h-screen">
        {children}
      </div>
      <MiniPlayer />
      <Player />
      <DictionaryInitializer />
    </>
  )
}
