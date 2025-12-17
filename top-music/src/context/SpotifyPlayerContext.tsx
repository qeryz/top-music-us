import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAccessToken } from '../services/spotify';
import { useAuth } from './AuthContext';

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
        Spotify: any;
    }
}

interface SpotifyPlayerContextType {
    player: any;
    deviceId: string | null;
    isReady: boolean;
    error: string | null;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | null>(null);

export const SpotifyPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [player, setPlayer] = useState<any>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        let active = true;

        if (!isAuthenticated) {
            if (player) {
                console.log('[SDK] User logged out, disconnecting player');
                player.disconnect();
                setPlayer(null);
                setDeviceId(null);
                setIsReady(false);
            }
            return;
        }

        const initializePlayer = async () => {
            if (!window.Spotify) return;

            try {
                const initialToken = await getAccessToken();

                if (!initialToken) {
                    const errorMsg = "[SDK] No access token available for Web Playback SDK";
                    console.error(errorMsg);
                    if (active) setError(errorMsg);
                    return;
                }

                console.log('[SDK] Initializing global player...');

                const playerInstance = new window.Spotify.Player({
                    name: 'Roadie Web Player',
                    getOAuthToken: async (cb: (token: string) => void) => { 
                        const token = await getAccessToken();
                        if (token) {
                            cb(token);
                        } else {
                            console.error('[SDK] Failed to get token for player');
                            if (active) setError('Failed to get access token');
                        }
                    },
                    volume: 0.5
                });

                playerInstance.addListener('ready', ({ device_id }: { device_id: string }) => {
                    console.log('[SDK] Ready with Device ID', device_id);
                    if (active) {
                        setDeviceId(device_id);
                        setIsReady(true);
                        setError(null);
                    }
                });

                playerInstance.addListener('not_ready', ({ device_id }: { device_id: string }) => {
                    console.log('[SDK] Device ID has gone offline', device_id);
                    if (active) {
                        setDeviceId(null);
                        setIsReady(false);
                    }
                });
                
                playerInstance.addListener('authentication_error', ({ message }: { message: string }) => {
                    console.error('[SDK] Auth Error:', message);
                    if (active) setError(`Authentication Error: ${message}`);
                });

                playerInstance.addListener('initialization_error', ({ message }: { message: string }) => {
                    console.error('[SDK] Init Error:', message);
                    if (active) setError(`Initialization Error: ${message}`);
                });

                playerInstance.addListener('account_error', ({ message }: { message: string }) => {
                    console.error('[SDK] Account Error:', message);
                    if (active) setError(`Account Error: ${message}. Premium required.`);
                });

                const connected = await playerInstance.connect();
                
                if (connected) {
                    console.log('[SDK] Player connected');
                    if (active) setPlayer(playerInstance);
                } else {
                    console.error('[SDK] Player failed to connect');
                    if (active) setError('Failed to connect player');
                }
            } catch (err) {
                console.error('[SDK] Exception during initialization', err);
                if (active) setError(err instanceof Error ? err.message : 'Unknown error');
            }
        };

        if (window.Spotify) {
            initializePlayer();
        } else {
            window.onSpotifyWebPlaybackSDKReady = initializePlayer;
            
            if (!document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
                const script = document.createElement("script");
                script.src = "https://sdk.scdn.co/spotify-player.js";
                script.async = true;
                document.body.appendChild(script);
            }
        }

        return () => {
            active = false;
            if (player) {
                player.disconnect();
            }
        };
    }, [isAuthenticated]);

    return (
        <SpotifyPlayerContext.Provider value={{ player, deviceId, isReady, error }}>
            {children}
        </SpotifyPlayerContext.Provider>
    );
};

export const useSpotifyPlayer = () => {
    const context = useContext(SpotifyPlayerContext);
    if (!context) {
        throw new Error('useSpotifyPlayer must be used within a SpotifyPlayerProvider');
    }
    return context;
};
