export interface User {
  username: string;
  avatarUrl: string;
  status?: string;
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  username: string;
  type: 'photo' | 'video' | 'voice' | 'text';
  content?: string;
  mediaUrl?: string; // URL pointing to uploaded photo/video on server
  voiceUrl?: string; // URL pointing to uploaded voice note on server
  sticker?: string;  // Sticker emoji or id
  filter?: string;   // CSS filter applied to photo
  timestamp: string;
  likes: string[];   // Array of usernames who liked this post
  comments: Comment[];
}

export interface Sticker {
  id: string;
  emoji: string;
  label: string;
  category: 'arabian' | 'reaction' | 'vibes';
}

export const STICKERS: Sticker[] = [
  // Arabian themed stickers
  { id: '1', emoji: '🕶️', label: 'Cooling Glass', category: 'arabian' },
  { id: '2', emoji: '☕', label: 'Gahwa Coffee', category: 'arabian' },
  { id: '3', emoji: '🌴', label: 'Date Palm', category: 'arabian' },
  { id: '4', emoji: '🐪', label: 'Camel', category: 'arabian' },
  { id: '5', emoji: '🕌', label: 'Minaret', category: 'arabian' },
  { id: '6', emoji: '✨', label: 'Glowing Lantern', category: 'arabian' },
  
  // Reactions
  { id: '7', emoji: '🔥', label: 'Lit', category: 'reaction' },
  { id: '8', emoji: '💯', label: 'One Hundred', category: 'reaction' },
  { id: '9', emoji: '😂', label: 'Laughing', category: 'reaction' },
  { id: '10', emoji: '🙌', label: 'Humble Hands', category: 'reaction' },
  { id: '11', emoji: '❤️', label: 'Heart', category: 'reaction' },
  { id: '12', emoji: '🤝', label: 'Respect', category: 'reaction' },

  // Vibes
  { id: '13', emoji: '🌅', label: 'Sunset Dunes', category: 'vibes' },
  { id: '14', emoji: '🦁', label: 'Majestic Lion', category: 'vibes' },
  { id: '15', emoji: '🦅', label: 'Falcon', category: 'vibes' },
  { id: '16', emoji: '🌙', label: 'Crescent Moon', category: 'vibes' },
];

export const PHOTO_FILTERS = [
  { name: 'Normal', class: '' },
  { name: 'Arabian Gold', class: 'sepia contrast-125 saturate-150 brightness-110 hue-rotate-15' },
  { name: 'Desert Sun', class: 'saturate-200 contrast-110 brightness-105' },
  { name: 'Oasis Cool', class: 'hue-rotate-180 saturate-125' },
  { name: 'Vintage Souq', class: 'grayscale contrast-125 brightness-95' },
  { name: 'Midnight', class: 'brightness-75 contrast-125 saturate-150 hue-rotate-320' },
  { name: 'Nostalgia', class: 'contrast-100 saturate-75 sepia-50' }
];

export const PRESET_USERS: User[] = [
  { username: 'Sinan', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
  { username: 'Muhammed', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
  { username: 'Faris', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
  { username: 'Hassan', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' },
  { username: 'Aisha', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
];
