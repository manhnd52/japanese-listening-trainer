import DictionaryInitializer from '@/components/provider/DictionaryInitializer'
import MiniPlayer from '@/features/miniplayer/components/MiniPlayer'
import Player from '@/features/player/Player'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <div className="pb-24">
          {children}
        </div>
        <MiniPlayer />
        <Player />
        <DictionaryInitializer />
    </>
  )
}
