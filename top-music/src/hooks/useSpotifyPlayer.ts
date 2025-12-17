import { useSpotifyPlayer as useGlobalSpotifyPlayer } from '../context/SpotifyPlayerContext';

/* 
    This hook now consumes the global context to ensure the player persists across navigation.
*/
export const useSpotifyPlayer = () => {
    return useGlobalSpotifyPlayer();
};
