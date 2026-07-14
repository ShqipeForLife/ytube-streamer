export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  cover: ReturnType<typeof require>;
  genre: string;
  gradientColors: string[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  cover: ReturnType<typeof require>;
  year: number;
  tracks: Track[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: ReturnType<typeof require>;
  trackCount: number;
  tracks: Track[];
  isUserCreated?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  image: ReturnType<typeof require>;
  genre: string;
  followers: string;
}

export interface SearchCategory {
  id: string;
  name: string;
  color: string;
}

const cover1 = require('@/assets/images/album1.png');
const cover2 = require('@/assets/images/album2.png');
const cover3 = require('@/assets/images/album3.png');

export const TRACKS: Track[] = [
  { id: '1', title: 'Neon Pulse', artist: 'Synth Nova', album: 'Neon Dreams', duration: 224, cover: cover1, genre: 'Electronic', gradientColors: ['#1a0533', '#2d1b69'] },
  { id: '2', title: 'Electric Sky', artist: 'Synth Nova', album: 'Neon Dreams', duration: 198, cover: cover1, genre: 'Electronic', gradientColors: ['#0d1b4b', '#1a0533'] },
  { id: '3', title: 'Retrowave Rush', artist: 'Synth Nova', album: 'Neon Dreams', duration: 245, cover: cover1, genre: 'Electronic', gradientColors: ['#2d1b69', '#0d1b4b'] },
  { id: '4', title: 'Golden Light', artist: 'Aria Sol', album: 'Golden Hours', duration: 213, cover: cover2, genre: 'Pop', gradientColors: ['#5c3317', '#8B4513'] },
  { id: '5', title: 'Sunset Drive', artist: 'Aria Sol', album: 'Golden Hours', duration: 187, cover: cover2, genre: 'Pop', gradientColors: ['#7B3F00', '#5c3317'] },
  { id: '6', title: 'Warm Embrace', artist: 'Aria Sol', album: 'Golden Hours', duration: 231, cover: cover2, genre: 'R&B', gradientColors: ['#8B4513', '#7B3F00'] },
  { id: '7', title: 'City Lights', artist: 'MC Phantom', album: 'Midnight City', duration: 203, cover: cover3, genre: 'Hip-Hop', gradientColors: ['#0a1628', '#1a2744'] },
  { id: '8', title: 'Street Code', artist: 'MC Phantom', album: 'Midnight City', duration: 216, cover: cover3, genre: 'Hip-Hop', gradientColors: ['#1a2744', '#0a1628'] },
  { id: '9', title: 'Urban Soul', artist: 'MC Phantom', album: 'Midnight City', duration: 194, cover: cover3, genre: 'Hip-Hop', gradientColors: ['#0d1f3c', '#1a2744'] },
  { id: '10', title: 'Lost Signal', artist: 'Synth Nova', album: 'Neon Dreams', duration: 262, cover: cover1, genre: 'Electronic', gradientColors: ['#1a0533', '#0d1b4b'] },
  { id: '11', title: 'Rise Up', artist: 'Aria Sol', album: 'Golden Hours', duration: 209, cover: cover2, genre: 'Pop', gradientColors: ['#8B4513', '#5c3317'] },
  { id: '12', title: 'Dark Matter', artist: 'MC Phantom', album: 'Midnight City', duration: 228, cover: cover3, genre: 'Hip-Hop', gradientColors: ['#0a1628', '#0d1f3c'] },
];

export const FEATURED_PLAYLISTS: Playlist[] = [
  {
    id: 'fp1',
    name: 'Neon Dreams',
    description: 'Synthwave & Electronic vibes',
    cover: cover1,
    trackCount: 4,
    tracks: TRACKS.filter((t) => t.album === 'Neon Dreams'),
  },
  {
    id: 'fp2',
    name: 'Golden Hours',
    description: 'Warm pop & R&B',
    cover: cover2,
    trackCount: 3,
    tracks: TRACKS.filter((t) => t.album === 'Golden Hours'),
  },
  {
    id: 'fp3',
    name: 'Midnight City',
    description: 'Urban hip-hop & rap',
    cover: cover3,
    trackCount: 4,
    tracks: TRACKS.filter((t) => t.album === 'Midnight City'),
  },
];

export const QUICK_PICKS: Track[] = TRACKS.slice(0, 6);

export const TRENDING_TRACKS: Track[] = [...TRACKS].sort(() => 0.5 - Math.random()).slice(0, 8);

export const ARTISTS: Artist[] = [
  { id: 'a1', name: 'Synth Nova', image: cover1, genre: 'Electronic', followers: '2.4M' },
  { id: 'a2', name: 'Aria Sol', image: cover2, genre: 'Pop / R&B', followers: '5.1M' },
  { id: 'a3', name: 'MC Phantom', image: cover3, genre: 'Hip-Hop', followers: '3.7M' },
];

export const SEARCH_CATEGORIES: SearchCategory[] = [
  { id: 'sc1', name: 'Pop', color: '#FF0055' },
  { id: 'sc2', name: 'Hip-Hop', color: '#FF6600' },
  { id: 'sc3', name: 'Electronic', color: '#6600FF' },
  { id: 'sc4', name: 'R&B', color: '#CC0066' },
  { id: 'sc5', name: 'Rock', color: '#333333' },
  { id: 'sc6', name: 'Jazz', color: '#996600' },
  { id: 'sc7', name: 'Classical', color: '#006699' },
  { id: 'sc8', name: 'Podcasts', color: '#009966' },
];

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
