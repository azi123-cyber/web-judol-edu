import { Banner } from './types';

// Menggunakan ASET LOKAL SVG yang tidak akan pernah error / kosong
export const BANNERS: Banner[] = [
  {
    id: 'mahjong',
    title: 'Mahjong Ways 2',
    provider: 'PG SOFT',
    image: '/mahjong.svg',
    gameType: 'MAHJONG',
    minBet: 800, maxBet: 1500000, rtp: 98.7, tag: 'GACOR'
  },
  {
    id: 'slot',
    title: 'Tower of Olympus',
    provider: 'PRAGMATIC PLAY',
    image: '/zeus.svg',
    gameType: 'SLOT',
    minBet: 200, maxBet: 2000000, rtp: 96.5, tag: 'HOT'
  },
  {
    id: 'mines',
    title: 'Mines',
    provider: 'SPRIBE',
    image: '/mines.svg',
    gameType: 'MINES',
    minBet: 1000, maxBet: 2000000, rtp: 97.0, tag: 'NEW'
  },
  {
    id: 'crash',
    title: 'Spaceman',
    provider: 'PRAGMATIC PLAY',
    image: '/crash.svg',
    gameType: 'CRASH',
    minBet: 1000, maxBet: 5000000, rtp: 97.0
  },
  {
    id: 'wheel',
    title: 'Crazy Time',
    provider: 'EVOLUTION',
    image: '/wheel.svg',
    gameType: 'WHEEL',
    minBet: 500, maxBet: 10000000, rtp: 92.5
  }
];

export const WINNERS_TICKER = [
  "🔥 INFO MAXWIN: Sistem sengaja dibuat mustahil menang secara matematis!",
  "⚠️ SISTEM BANDAR: Tingkat kekalahan Anda 99%. Silakan sedekah ke bandar.",
  "⚡ POLA GACOR HARI INI: Sama sekali tidak ada. Semua pola itu kebohongan admin.",
  "🔥 SERVER LUAR VVIP AKUN PRO (Semua itu trik marketing palsu 100%)",
  "⚠️ KATA BANDAR: Makasih buat lo yang udah bayarin liburan gue hari ini!",
  "🏆 RTP LIVE 99% UPDATE SETIAP DETIK (Cumalah angka palsu HTML buatan kami)",
  "⚠️ FAKTA KOMINFO: Situs seperti ini telah menghancurkan jutaan generasi muda.",
];

export const RUNGKAD_MESSAGES = [
  "RUNGKAD MASBRO!! Duit segitu doang? Pinjol masih gampang cair kok!",
  "MAMPUS LO! Bandar lagi butuh bayar cicilan Porsche, makasih donasinya ya.",
  "KASIAN DEH LUU! Baru main udah kesedot, emang enak dikibulin kode sistem?",
  "ZONK TERUS! Udah dibilangin ini settingan software, masih aja ngarep cuan.",
  "YAH RATANYA CEPET AMAT? Gaji sebulan habis buat ngempanin server server kita nih?",
  "BANDAR FULL SENYUM! Lo kira gampang menangin duit dari mesin? Mimpi sana!",
];
