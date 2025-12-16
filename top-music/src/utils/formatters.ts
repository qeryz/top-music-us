export const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
};

/**
 * Formats cumulative playback time in milliseconds to a human-readable string
 * - Under 60 minutes: "45:30" (MM:SS)
 * - 60+ minutes: "1 hour 14 minutes" or "2 hours"
 */
export const formatPlaybackTime = (ms: number): string => {
    const totalMinutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (totalMinutes < 60) {
        // Under 1 hour: show MM:SS
        return `${totalMinutes}:${String(seconds).padStart(2, '0')}`;
    } else {
        // 1+ hours: show "X hour(s) Y minutes"
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const hourText = hours === 1 ? 'hour' : 'hours';
        const minuteText = minutes === 1 ? 'minute' : 'minutes';
        
        if (minutes === 0) {
            return `${hours} ${hourText}`;
        } else {
            return `${hours} ${hourText} ${minutes} ${minuteText}`;
        }
    }
};
