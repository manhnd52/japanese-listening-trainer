import { RootState } from '../../index'

const selectCurrentAudip = (state: RootState) => state.player.currentAudio;
const selectIsPlaying = (state: RootState) => state.player.isPlaying;
const selectProgress = (state: RootState) => state.player.progress;
const selectIsExpanded = (state: RootState) => state.player.isExpanded;

export {
    selectCurrentAudip,
    selectIsPlaying,
    selectProgress,
    selectIsExpanded
}