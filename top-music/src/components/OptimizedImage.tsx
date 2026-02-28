import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Music } from 'lucide-react';
import { cn } from '../utils/cn';

// Global session-level cache to track already-loaded image URLs.
const LOADED_IMAGE_CACHE = new Set<string>();

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackIcon?: React.ReactNode;
    containerClassName?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
    src, 
    alt, 
    className, 
    containerClassName,
    fallbackIcon,
    ...props 
}) => {
    const isCached = typeof src === 'string' && LOADED_IMAGE_CACHE.has(src);
    
    // 1. Initialize loaded state based on session cache.
    const [isLoaded, setIsLoaded] = useState(isCached);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // 2. Sync state if src changes to something we already have in our session cache.
    // Doing this during render prevents a "blink" when props update.
    if (isCached && !isLoaded) {
        setIsLoaded(true);
    }

    // 3. Monitor browser-level cache on every mount/src-change.
    useLayoutEffect(() => {
        if (imgRef.current?.complete && imgRef.current.src === src) {
            if (!isLoaded) {
                setIsLoaded(true);
                if (src) LOADED_IMAGE_CACHE.add(src);
            }
        }
    }, [src, isLoaded]);

    // 4. Reset states if we get a brand new URL we haven't seen.
    useEffect(() => {
        if (src && !LOADED_IMAGE_CACHE.has(src)) {
            // Only reset if the browser hasn't already completed it (synchronous cache)
            if (!imgRef.current?.complete) {
                setIsLoaded(false);
            }
        }
        setHasError(false);
    }, [src]);

    return (
        <div className={cn(
            "relative overflow-hidden bg-zinc-900 flex items-center justify-center isolation-isolate",
            containerClassName
        )}>
            {/* 1. Underlying Base Background (Always visible) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 bg-black/20">
                {fallbackIcon || <Music className="w-1/3 h-1/3 text-white" />}
            </div>

            {/* 2. Loading State Overlay (Only if truly unknown/loading) */}
            {src && !isLoaded && !hasError && (
                <div className="absolute inset-0 animate-pulse-slow bg-white/5 flex items-center justify-center pointer-events-none z-[1]" />
            )}

            {/* 3. Actual Image */}
            {src && !hasError && (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt || ""}
                    style={{ 
                        opacity: isLoaded ? 1 : 0.01,
                    }}
                    className={cn(
                        "w-full h-full object-cover pointer-events-none relative z-[2]",
                        // Disable transition completely for cached images to eliminate "mount flickers"
                        !isCached && "transition-opacity duration-300 ease-in",
                        className
                    )}
                    onLoad={() => {
                        setIsLoaded(true);
                        if (src) LOADED_IMAGE_CACHE.add(src);
                    }}
                    onError={() => setHasError(true)}
                    loading={props.loading || "lazy"}
                    decoding={props.decoding || "async"}
                    {...props}
                />
            )}

            {/* 4. Failure Layer */}
            {hasError && (
                <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center z-[3] pointer-events-none">
                     <span className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">Error</span>
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
