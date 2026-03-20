import React, { useState, useCallback, useRef } from 'react';
import { X, Play } from 'lucide-react';
import { Banner, SpinResult, UserState } from '../types';
import { RUNGKAD_MESSAGES } from '../constants';

interface SlotFruitGameProps {
  banner: Banner;
  user: UserState;
  onSpin: (cost: number, result: SpinResult) => void;
  onClose: () => void;
}

const SYMBOLS = [
  { s: '🍒', v: 2 },  { s: '🍋', v: 3 },  { s: '🍊', v: 4 },
  { s: '🔔', v: 5 },  { s: '💎', v: 10 }, { s: '⭐', v: 8 },
  { s: '7️⃣', v: 15 }, { s: '🎰', v: 20 }
];
const symList = SYMBOLS.map(s => s.s);

const calcResult = (spinCount: number, bet: number): SpinResult => {
  if (spinCount < 3) {
    const mult = [3, 2, 5][spinCount] ?? 2;
    return { type: 'BIG_WIN', multiplier: mult, winAmount: Math.floor(bet * mult), message: 'BIG WIN!' };
  }
  const r = Math.random();
  if (r > 0.998) return { type: 'MAXWIN', multiplier: 100, winAmount: bet * 100, message: 'MAXWIN! 7-7-7!' };
  if (r > 0.97)  return { type: 'MEGA_WIN', multiplier: 10, winAmount: bet * 10, message: 'MEGA WIN!' };
  if (r > 0.88)  return { type: 'BIG_WIN', multiplier: 2, winAmount: bet * 2, message: 'WIN!' };
  return { type: 'ZONK', multiplier: 0, winAmount: 0, message: RUNGKAD_MESSAGES[Math.floor(Math.random() * RUNGKAD_MESSAGES.length)] };
};

export const SlotFruitGame: React.FC<SlotFruitGameProps> = ({ banner, user, onSpin, onClose }) => {
  const [bet, setBet] = useState(banner.minBet);
  const [reels, setReels] = useState(['🎰','🎰','🎰']);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [showWin, setShowWin] = useState(false);

  const adjustBet = (m: number) => {
    let n = Math.round(bet * m / 100) * 100;
    if (n < banner.minBet) n = banner.minBet;
    if (n > banner.maxBet) n = banner.maxBet;
    setBet(n);
  };

  const handleSpin = useCallback(() => {
    if (spinning || user.balance < bet) return;
    setSpinning(true);
    setLastResult(null);
    setShowWin(false);

    const result = calcResult(user.spinCount, bet);
    let count = 0;
    const totalFrames = 30;

    const interval = setInterval(() => {
      count++;
      if (count < totalFrames) {
        setReels(prev => prev.map(() => symList[Math.floor(Math.random() * symList.length)]));
      } else if (count === totalFrames) {
        if (result.type !== 'ZONK') {
          const winSym = symList[Math.floor(Math.random() * 4)];
          setReels([winSym, winSym, winSym]);
          setShowWin(true);
          setTimeout(() => setShowWin(false), 3000);
        } else {
          let final = [symList[Math.floor(Math.random() * symList.length)],symList[Math.floor(Math.random() * symList.length)],symList[Math.floor(Math.random() * symList.length)]];
          // Ensure not all same for zonk
          while(final[0]===final[1] && final[1]===final[2]) {
            final[2] = symList[Math.floor(Math.random() * symList.length)];
          }
          setReels(final);
        }
        setLastResult(result);
        onSpin(bet, result);
        clearInterval(interval);
        setTimeout(() => setSpinning(false), 300);
      }
    }, 40);
  }, [spinning, user.balance, user.spinCount, bet, onSpin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/95 backdrop-blur-md">
      <div className="bg-gradient-to-b from-[#1a0530] via-[#0d0120] to-black border-2 border-purple-500 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.4)] flex flex-col relative">
        
        {/* Neon decorative top bar */}
        <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse"></div>
        
        <div className="px-5 py-3 flex justify-between items-center bg-[#0d0120] border-b border-purple-900/50">
          <div>
            <h2 className="text-purple-300 font-black text-2xl italic tracking-widest uppercase">{banner.title}</h2>
            <span className="text-[10px] text-gray-600 font-mono">{banner.provider} | RTP {banner.rtp}%</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white bg-gray-900 rounded-full p-2"><X size={18}/></button>
        </div>

        {/* Slot Machine Cabinet */}
        <div className="relative p-8 bg-gradient-to-b from-[#12004a] to-[#05001a] flex justify-center">
          
          {/* Glowing top deco */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent blur-sm"></div>
          
          <div className="bg-[#08001a] rounded-2xl border-4 border-[#4a1277] p-4 w-full shadow-[inset_0_0_40px_rgba(0,0,0,0.9),0_0_20px_rgba(168,85,247,0.2)] relative">
            
            <div className="flex justify-center gap-3">
              {reels.map((sym, i) => (
                <div key={i} className="relative w-20 h-24 md:w-28 md:h-32 bg-gradient-to-b from-[#1e0040] to-[#0a001a] rounded-xl border-2 border-[#5b1fa0] flex items-center justify-center overflow-hidden shadow-[inset_0_0_20px_rgba(100,30,200,0.3)]">
                  <div className={`text-5xl md:text-6xl ${spinning ? 'animate-bounce' : ''}`}>{sym}</div>
                  {/* Overlay scanlines */}
                  <div className="absolute inset-0 pointer-events-none" style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.1) 0px, rgba(0,0,0,.1) 1px, transparent 1px, transparent 4px)'}}></div>
                </div>
              ))}
            </div>

            {showWin && lastResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl z-10 pointer-events-none animate-in fade-in">
                <div className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(255,200,0,1)] italic">
                  {lastResult.type === 'MAXWIN' ? '🎉 MAXWIN!!!' : '💎 WIN!!!'}
                </div>
                <div className="text-2xl font-black text-white mt-1">+Rp {lastResult.winAmount.toLocaleString('id-ID')}</div>
              </div>
            )}
          </div>

          {/* Payline */}
          <div className="absolute left-6 right-6 top-1/2 flex items-center pointer-events-none">
            <div className="flex-1 h-0.5 bg-red-500/60"></div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-black border-t border-purple-900/30 space-y-3">
          <div className="flex justify-between items-center bg-gray-900/80 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-500 text-sm font-mono">SALDO</span>
            <span className="text-green-400 font-black font-mono text-xl">Rp {user.balance.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-900 rounded-lg border border-gray-700 flex items-center">
              <button onClick={() => adjustBet(0.5)} disabled={spinning} className="px-4 py-3 text-purple-400 hover:text-white text-xl font-black">-</button>
              <div className="flex-1 text-center text-yellow-400 font-black font-mono">Rp {bet.toLocaleString('id-ID')}</div>
              <button onClick={() => adjustBet(2)} disabled={spinning} className="px-4 py-3 text-purple-400 hover:text-white text-xl font-black">+</button>
            </div>
            <button 
              onClick={handleSpin} disabled={spinning || user.balance < bet}
              className={`w-24 h-16 rounded-xl font-black text-lg uppercase tracking-widest flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border-b-4 ${
                spinning ? 'bg-gray-800 text-gray-600 border-gray-900' 
                : 'bg-gradient-to-b from-purple-400 to-purple-600 text-white border-purple-900 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:brightness-110'
              }`}>
              <Play size={20} fill={spinning ? undefined : "currentColor"}/>
              SPIN
            </button>
          </div>
        </div>
        
        <div className="h-1 bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 animate-pulse"></div>
      </div>
    </div>
  );
};
