import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';

interface Story {
  id: string;
  username: string;
  avatarUrl: string;
  storyMedia: string;
  caption: string;
}

const PRESET_STORIES: Story[] = [
  {
    id: 's1',
    username: 'Sinan',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    storyMedia: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800',
    caption: 'Rocking the golden hour vibes! 😎🌅'
  },
  {
    id: 's2',
    username: 'Muhammed',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    storyMedia: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    caption: 'Late night sessions with the close circle. ☕️🌙'
  },
  {
    id: 's3',
    username: 'Faris',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    storyMedia: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=800',
    caption: 'Liwa Dunes - shifting sand sands of time!'
  },
  {
    id: 's4',
    username: 'Aisha',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    storyMedia: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800',
    caption: 'Sunset in Muscat is magical. ✨🇴🇲'
  }
];

export const StoryTray: React.FC = () => {
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  // Auto advancement timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeStoryIdx !== null) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 40); // Total 4000ms (4s) per story
    }
    return () => clearInterval(interval);
  }, [activeStoryIdx]);

  const handleOpenStory = (idx: number) => {
    setActiveStoryIdx(idx);
    setProgress(0);
  };

  const handleClose = () => {
    setActiveStoryIdx(null);
  };

  const handleNext = () => {
    if (activeStoryIdx === null) return;
    if (activeStoryIdx < PRESET_STORIES.length - 1) {
      setActiveStoryIdx(activeStoryIdx + 1);
      setProgress(0);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (activeStoryIdx === null) return;
    if (activeStoryIdx > 0) {
      setActiveStoryIdx(activeStoryIdx - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  };

  return (
    <div className="w-full">
      {/* Horizonal Scroll Tray */}
      <div className="flex items-center gap-4 bg-[#111] border border-[#222] rounded-3xl p-4 overflow-x-auto select-none scrollbar-thin">
        {PRESET_STORIES.map((story, idx) => (
          <button
            key={story.id}
            onClick={() => handleOpenStory(idx)}
            className="flex flex-col items-center flex-shrink-0 gap-1.5 focus:outline-none transition-transform active:scale-95 group cursor-pointer"
          >
            <div className="relative">
              {/* Colorful active ring */}
              <div className="absolute inset-[-3px] rounded-full bg-gradient-to-tr from-brand-gold via-yellow-500 to-amber-700 p-0.5 animate-pulse-ring" />
              <div className="w-14 h-14 rounded-full border-2 border-[#111] overflow-hidden relative z-10">
                <img
                  src={story.avatarUrl}
                  alt={story.username}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors truncate max-w-[65px]">
              @{story.username}
            </span>
          </button>
        ))}
      </div>

      {/* Immersive Full Screen Story Modal */}
      {activeStoryIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none animate-fade-in">
          {/* Main Container */}
          <div className="relative w-full max-w-md h-full sm:h-[85vh] sm:rounded-3xl overflow-hidden bg-[#0F0F0F] flex flex-col justify-between border border-[#222] shadow-2xl">
            {/* Story Top Progress Bars */}
            <div className="absolute top-3 left-0 right-0 z-30 px-3 flex gap-1">
              {PRESET_STORIES.map((story, idx) => (
                <div key={story.id} className="h-1 bg-white/20 rounded-full flex-1 overflow-hidden">
                  <div
                    style={{
                      width:
                        idx < activeStoryIdx
                          ? '100%'
                          : idx === activeStoryIdx
                          ? `${progress}%`
                          : '0%'
                    }}
                    className="h-full bg-[#D4AF37] transition-all duration-75 ease-linear rounded-full"
                  />
                </div>
              ))}
            </div>

            {/* Story Header (Poster Info) */}
            <div className="absolute top-6 left-0 right-0 z-30 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={PRESET_STORIES[activeStoryIdx].avatarUrl}
                  alt={PRESET_STORIES[activeStoryIdx].username}
                  className="w-8 h-8 rounded-full border border-[#D4AF37]/50"
                  referrerPolicy="no-referrer"
                />
                <span className="text-sm font-bold text-white drop-shadow">
                  @{PRESET_STORIES[activeStoryIdx].username}
                </span>
                <span className="bg-[#D4AF37]/80 text-black text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  Story
                </span>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:text-[#D4AF37] bg-black/30 p-1.5 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Controls Left/Right */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm transition-colors hidden sm:block cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm transition-colors hidden sm:block cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Interactive tap left/right overlay for mobile */}
            <div className="absolute inset-0 z-10 flex">
              <div onClick={handlePrev} className="w-1/3 h-full cursor-pointer" />
              <div onClick={handleNext} className="w-2/3 h-full cursor-pointer" />
            </div>

            {/* Story Media (Vertical oriented illustration) */}
            <div className="flex-1 w-full relative flex items-center justify-center bg-black">
              <img
                src={PRESET_STORIES[activeStoryIdx].storyMedia}
                alt="Story content"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Bottom caption overlay */}
              <div className="absolute bottom-10 left-0 right-0 z-20 px-6 text-center text-white drop-shadow bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-4">
                <p className="text-lg font-serif italic text-white leading-relaxed">
                  "{PRESET_STORIES[activeStoryIdx].caption}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
