import { useEffect, useState } from 'react';
import { getAccessToken } from '../services/spotify';

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
        Spotify: any;
    }
}

/* 
    This hook is used to initialize the Spotify Web Playback SDK and manage the player state.
*/
export const useSpotifyPlayer = () => {
    const [player, setPlayer] = useState<any>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {        
        // Check if script already exists
        if (document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
            return;
        }

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        
        script.onload = () => {
            console.log('[SDK] Script loaded successfully');
        };
        
        script.onerror = () => {
            console.error('[SDK] Failed to load Spotify SDK script');
            setError('Failed to load Spotify SDK');
        };
        
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = async () => {
            try {
                // Verify we can get a token initially
                const initialToken = await getAccessToken();

                if (!initialToken) {
                    const errorMsg = "[SDK] No access token available for Web Playback SDK";
                    console.error(errorMsg);
                    setError(errorMsg);
                    return;
                }

                console.log('[SDK] Initial token retrieved successfully');

                const playerInstance = new window.Spotify.Player({
                    name: 'Roadie Web Player',
                    getOAuthToken: async (cb: (token: string) => void) => { 
                        // Dynamically fetch token each time Spotify requests it
                        const token = await getAccessToken();
                        if (token) {
                            console.log('[SDK] Token provided to player');
                            cb(token);
                        } else {
                            console.error('[SDK] Failed to get token for player');
                            setError('Failed to get access token');
                        }
                    },
                    volume: 0.5
                });

                playerInstance.addListener('ready', ({ device_id }: { device_id: string }) => {
                    setDeviceId(device_id);
                    setIsReady(true);
                    setError(null);
                });

                playerInstance.addListener('not_ready', ({ device_id }: { device_id: string }) => {
                    setDeviceId(null);
                    setIsReady(false);
                });
                
                playerInstance.addListener('authentication_error', ({ message }: { message: string }) => {
                    setError(`Authentication Error: ${message}`);
                });

                playerInstance.addListener('initialization_error', ({ message }: { message: string }) => {
                    setError(`Initialization Error: ${message}`);
                });

                playerInstance.addListener('account_error', ({ message }: { message: string }) => {
                    setError(`Account Error: ${message}. Premium required.`);
                });

                const connected = await playerInstance.connect();
                
                if (connected) {
                    setPlayer(playerInstance);
                } else {
                    setError('Failed to connect player');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
        };

        return () => {
            if (player) {
                player.disconnect();
            }
        };
    }, []);

    return { player, deviceId, isReady, error };
};
