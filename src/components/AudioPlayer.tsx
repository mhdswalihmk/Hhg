import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [waveHeights] = useState(() => Array.from({ length: 24 }, () => Math.floor(Math.random() * 24) + 6));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    // Initial check in case it's preloaded
    if (audio.duration) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Playback error", e));
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newPercentage = Math.max(0, Math.min(1, clickX / width));
    
    audioRef.current.currentTime = newPercentage * duration;
    setCurrentTime(audioRef.current.currentTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playbackPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-[#1A1A1A] border border-[#333] rounded-2xl px-5 py-4 flex items-center gap-4 w-full max-w-sm shadow-xl">
      {/* Play Button */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        id="voice-play-toggle"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-[#D4AF37]" />
        ) : (
          <Play className="w-4 h-4 fill-[#D4AF37] ml-0.5" />
        )}
      </button>

      {/* Waveform and Progress */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Waveform Visualization */}
        <div className="flex items-end gap-0.5 h-6 mb-1.5 opacity-85">
          {waveHeights.map((height, idx) => {
            const barPercentage = (idx / waveHeights.length) * 100;
            const isActive = playbackPercentage >= barPercentage;
            return (
              <div
                key={idx}
                style={{ height: `${height}px` }}
                className={`w-1 rounded-t-sm transition-colors duration-150 ${
                  isActive ? 'bg-[#D4AF37]' : 'bg-white/20'
                }`}
              />
            );
          })}
        </div>

        {/* Custom Progress Track */}
        <div
          ref={progressRef}
          onClick={handleProgressBarClick}
          className="h-1 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer relative"
        >
          <div
            style={{ width: `${playbackPercentage}%` }}
            className="h-full bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] rounded-full transition-all duration-75"
          />
        </div>

        {/* Time Counter */}
        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-1">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[#D4AF37]/60">Voice Note</span>
          <span>{formatTime(duration || 15)}</span> {/* fallback display 15s if loading */}
        </div>
      </div>

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="text-gray-500 hover:text-[#D4AF37] transition-colors p-1 cursor-pointer"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
