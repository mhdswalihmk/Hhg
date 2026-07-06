import React, { useState } from 'react';
import { STICKERS, Sticker } from '../types';

interface StickerPickerProps {
  onSelectSticker: (stickerEmoji: string) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelectSticker }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'arabian' | 'reaction' | 'vibes'>('all');

  const filteredStickers = STICKERS.filter(sticker => {
    if (activeTab === 'all') return true;
    return sticker.category === activeTab;
  });

  return (
    <div className="bg-brand-charcoal border border-gray-800 rounded-xl p-4 w-full">
      <div className="flex border-b border-gray-800 pb-2 mb-3 overflow-x-auto gap-2">
        {(['all', 'arabian', 'reaction', 'vibes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-xs font-semibold rounded-full capitalize whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-brand-gold text-brand-charcoal'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-48 overflow-y-auto p-1">
        {filteredStickers.map((sticker) => (
          <button
            key={sticker.id}
            type="button"
            onClick={() => onSelectSticker(sticker.emoji)}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-brand-slate/40 border border-transparent hover:border-brand-gold/30 hover:bg-brand-slate hover:scale-110 active:scale-95 transition-all group"
            title={sticker.label}
          >
            <span className="text-3xl filter drop-shadow-md group-hover:animate-bounce">
              {sticker.emoji}
            </span>
            <span className="text-[9px] text-gray-500 mt-1 truncate max-w-full text-center">
              {sticker.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
