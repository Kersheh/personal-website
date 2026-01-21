import { NextResponse } from 'next/server';
import { generateId } from '@/app/utils/id';
import { chatCache } from '../cache';

const adjectives = [
  'Bold',
  'Bright',
  'Clever',
  'Cosmic',
  'Crystal',
  'Digital',
  'Dynamic',
  'Electric',
  'Enigma',
  'Golden',
  'Lunar',
  'Mystic',
  'Neon',
  'Phoenix',
  'Quantum',
  'Radiant',
  'Shadow',
  'Silver',
  'Solar',
  'Stellar',
  'Swift',
  'Thunder',
  'Turbo',
  'Vapor',
  'Zenith'
];

const nouns = [
  'Atom',
  'Blaze',
  'Bolt',
  'Comet',
  'Cyber',
  'Echo',
  'Flame',
  'Ghost',
  'Hawk',
  'Nova',
  'Orbit',
  'Pixel',
  'Pulse',
  'Razor',
  'Spark',
  'Storm',
  'Tiger',
  'Viper',
  'Wave',
  'Wolf'
];

const generateUsername = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 99) + 1;
  return `${adjective}${noun}${number}`;
};

export async function POST() {
  const userId = generateId();
  const username = generateUsername();

  chatCache.addUser(userId, username);

  return NextResponse.json({
    userId,
    username,
    success: true
  });
}
