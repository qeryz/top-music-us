import { useEffect, useState } from 'react';
import type { SpotifyPlayer, SpotifyPlayerState } from '../services/spotify';

export const usePlayerState = (player: SpotifyPlayer | null) => {
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState<boolean>(true);

    useEffect(() => {
        if (!player) return;

        const stateListener = (state: SpotifyPlayerState) => {
            if (!state) {
                setPlayingTrackId(null);
                return;
            }

            // state.track_window.current_track contains info about the currently playing track
            if (state.paused) {
                setIsPaused(true);
            } else if (state.track_window?.current_track) {
                // Extract the track ID from the URI (format: spotify:track:ID)
                const trackUri = state.track_window.current_track.uri;
                const trackId = trackUri.split(':')[2];
                setPlayingTrackId(trackId);
                setIsPaused(false);
            }
        };

        player.addListener('player_state_changed', stateListener);

        return () => {
            player.removeListener('player_state_changed', stateListener);
        };
    }, [player]);

    return { playingTrackId, isPaused };
};
