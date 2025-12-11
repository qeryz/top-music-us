import { playTrack, type SpotifyTrack } from '../services/spotify';

interface PlaybackControlsParams {
    deviceId: string | null;
    sdkError: string | null;
    player: any;
    playingTrackId: string | null;
    isPaused: boolean;
}

export const handlePlayTrack = async (
    track: SpotifyTrack,
    { deviceId, sdkError, player, playingTrackId, isPaused }: PlaybackControlsParams
) => {
    if (sdkError) {
        alert(`Spotify Player Error: ${sdkError}`);
        return;
    }

    if (!deviceId) {
        console.error('[PlaylistDetail] No device ID available');
        alert("Spotify Web Player is still loading. Please wait or check console for errors...");
        return;
    }

    if (playingTrackId === track.id) {
        if (isPaused) {
            player?.resume();
        } else {
            player?.pause();
        }
        // Note: playingTrackId will be updated by the state listener
    } else {
        try {
            await playTrack(deviceId, track.uri);
            // Note: playingTrackId will be updated by the state listener when playback actually starts
        } catch (e) {
            alert("Failed to start playback. Do you have Spotify Premium?");
        }
    }
};
