import React, { useState, useEffect } from 'react';
import { X, User, Zap, Loader2, List, History } from 'lucide-react';
import { Banner, SpinResult, UserState } from '../types';

interface MahjongGameProps {
  banner: Banner;
  user: UserState;
  onSpin: (cost: number, result: SpinResult) => void;
  onClose: () => void;
}

// Custom Icons for bottom bar
const AutoSpinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const TurboIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

const TILES = ['🐉', '🏮', '🧧', '🉐', '💮', '🍀', '🏅', '🪙', '✨'];
const REEL_HEIGHTS = [4, 5, 5, 5, 4]; // Mahjong Ways 2 pattern

const generateReels = () => {
    return REEL_HEIGHTS.map(height => 
        Array.from({length: height}, () => TILES[Math.floor(Math.random() * TILES.length)])
    );
};

export const MahjongGame: React.FC<MahjongGameProps> = ({ banner, user, onSpin, onClose }) => {
  const [bet, setBet] = useState(banner.minBet);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>(generateReels());
  const [multiplierIdx, setMultiplierIdx] = useState(0); // 0=x1, 1=x2, 2=x3, 3=x5
  const [winAnim, setWinAnim] = useState<number | null>(null);
  const [localBalance, setLocalBalance] = useState(user.balance);
  const MULTIPLIERS = [1, 2, 3, 5];

  useEffect(() => {
    if (!isSpinning) {
       setLocalBalance(user.balance);
    }
  }, [user.balance, isSpinning]);

  const handleSpin = () => {
    if (localBalance < bet || isSpinning) return;
    setIsSpinning(true);
    setLocalBalance(prev => prev - bet);
    setMultiplierIdx(0);
    setWinAnim(null);

    let spins = 0;
    const interval = setInterval(() => {
        setReels(generateReels());
        spins++;
        if (spins > 10) {
            clearInterval(interval);
            finishSpin();
        }
    }, 100);
  };

  const finishSpin = () => {
    const isWin = (user.spinCount % 3 === 0) && user.spinCount > 0; // Simple win logic for visual demonstration
    const finalReels = generateReels();
    
    if (isWin) {
       const winTile = '🐉';
       finalReels[0][1] = winTile;
       finalReels[1][2] = winTile;
       finalReels[2][2] = winTile;
       finalReels[3][2] = winTile;
       finalReels[4][1] = winTile;
       setReels(finalReels);
       
       setTimeout(() => setMultiplierIdx(1), 500);
       setTimeout(() => {
           setMultiplierIdx(3);
           const winAmount = bet * 15;
           setWinAnim(winAmount);
           onSpin(bet, {
              type: 'MEGA_WIN', 
              multiplier: 15, 
              winAmount, 
              message: `SCATTER HIT! +Rp ${winAmount.toLocaleString('id-ID')}`
           });
           setIsSpinning(false);
       }, 1200);
    } else {
       finalReels[0][0] = '🧧'; finalReels[1][0] = '🏮'; finalReels[2][0] = '💮';
       setReels(finalReels);
       setTimeout(() => {
           onSpin(bet, { type: 'ZONK', multiplier: 0, winAmount: 0, message: 'RUNGKAD!' });
           setIsSpinning(false);
       }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-black/95 backdrop-blur-sm sm:p-4">
      {/* Main Game Container */}
      <div className="w-full max-w-[480px] h-full sm:h-auto sm:max-h-[95dvh] relative overflow-hidden flex flex-col items-center
                      bg-gradient-to-b from-[#8a1c1c] via-[#5c0f0f] to-[#360808] sm:rounded-3xl border-0 sm:border-4 border-[#ffb13b] shadow-[0_0_50px_rgba(255,177,59,0.3)]">
        
        {/* Decorative Golden Dragon Header */}
        <div className="absolute top-0 w-full h-24 bg-[url('https://www.transparenttextures.com/patterns/chinese-dragon.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>

        {/* Top Header Log */}
        <div className="w-full flex justify-between items-center px-4 py-3 bg-black/40 border-b border-[#ffb13b]/30 z-10 backdrop-blur-md">
           <button onClick={onClose} className="text-[#ffd700] hover:text-white transition-colors p-1 bg-black/50 rounded-full"><X size={20}/></button>
           <h3 className="text-[#ffd700] font-black tracking-widest text-sm uppercase drop-shadow-[0_2px_2px_#000] mx-auto">MAHJONG WAYS 2</h3>
        </div>

        {/* Multipliers Bar */}
        <div className="w-full px-2 py-3 z-10 flex justify-center mt-2 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffd700]/10 to-transparent"></div>
            <div className="flex gap-1 bg-[#1a0505]/60 p-1.5 rounded-full border border-[#ffb13b]/40 backdrop-blur-sm shadow-xl">
                {MULTIPLIERS.map((m, i) => (
                    <div key={m} className={`w-14 h-10 sm:w-16 sm:h-12 flex items-center justify-center rounded-full font-black text-xl transition-all duration-300 relative
                        ${i === multiplierIdx 
                            ? 'bg-gradient-to-b from-[#fff1a0] via-[#ffd700] to-[#b8860b] text-[#360808] scale-110 shadow-[0_0_15px_rgba(255,215,0,0.8)] border border-white z-10' 
                            : 'bg-gradient-to-b from-[#4a0d0d] to-[#2a0505] text-[#ffb13b]/60 border border-[#ffb13b]/20'}
                    `}>
                       {i === multiplierIdx && <div className="absolute inset-0 rounded-full border-2 border-[#fff1a0] animate-pulse"></div>}
                       x{m}
                    </div>
                ))}
            </div>
        </div>

        {/* Game Grid Play Area */}
        <div className="flex-1 w-full flex flex-col items-center justify-center relative p-2 my-2 min-h-0 z-10">
            
            {/* Grid Container */}
            <div className="flex gap-1 items-center justify-center p-3 bg-black/30 backdrop-blur-sm rounded-2xl border-2 border-[#ffb13b]/50 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] relative">
                
                {/* Pattern Overlay on Grid */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                {reels.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-1 relative z-10">
                        {col.map((tile, rowIdx) => {
                            const isGold = (colIdx > 0 && colIdx < 4) && (rowIdx === 2 || rowIdx === 3);
                            return (
                                <div key={`${colIdx}-${rowIdx}`} className={`
                                    w-[50px] h-[58px] sm:w-[68px] sm:h-[76px] rounded-lg border-b-4 flex flex-col items-center justify-center transition-all duration-100 ease-in-out relative overflow-hidden
                                    ${isGold 
                                        ? 'bg-gradient-to-b from-[#fff7c2] via-[#ffd700] to-[#b8860b] border-[#8a6a12] shadow-[0_2px_10px_rgba(255,215,0,0.4)]' 
                                        : 'bg-gradient-to-b from-[#f5f5f5] via-[#e0e0e0] to-[#b3b3b3] border-[#8a8a8a] shadow-md'}
                                    ${isSpinning ? 'opacity-80 scale-95 blur-[1px] translate-y-[-10px]' : 'opacity-100 scale-100 blur-0 translate-y-0'}
                                `}>
                                    {isGold && <div className="absolute top-0 right-0 w-8 h-8 bg-white/40 rotate-45 transform translate-x-4 -translate-y-2"></div>}
                                    <span style={{filter: isGold ? 'sepia(1) hue-rotate(-10deg) saturate(2)' : 'none'}} className={`text-3xl sm:text-5xl ${isGold ? 'drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]' : 'text-slate-800'}`}>{tile}</span>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* Win Animation Overlay */}
            {winAnim && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="bg-black/60 absolute inset-0 backdrop-blur-sm animate-in fade-in duration-300"></div>
                    <div className="relative text-center animate-in zoom-in duration-500 delay-100 scale-125">
                       <h2 className="text-4xl sm:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-[#fff1a0] via-[#ffd700] to-[#b8860b] drop-shadow-[0_5px_5px_#000] mb-2 uppercase" style={{WebkitTextStroke: '2px #360808'}}>MEGA WIN!</h2>
                       <div className="text-3xl sm:text-4xl font-black text-white font-mono drop-shadow-[0_2px_10px_#ffd700] bg-black/50 px-6 py-2 rounded-full border border-[#ffd700] inline-block">
                           Rp {winAnim.toLocaleString('id-ID')}
                       </div>
                    </div>
                </div>
            )}
        </div>

        {/* Win Status Bar */}
        <div className="w-full bg-gradient-to-b from-[#ffb13b] via-[#ffd700] to-[#b8860b] py-1.5 px-4 text-center z-10 shadow-[0_0_20px_rgba(255,215,0,0.3)] border-t border-b border-[#fff1a0]">
            <span className="text-[#360808] font-black text-xs sm:text-sm tracking-widest uppercase">
                {winAnim ? `MENANG ${winAnim.toLocaleString('id-ID')}!` : 'MAHJONG WAYS 2'}
            </span>
        </div>

        {/* Bottom Control Bar Area */}
        <div className="w-full bg-black/90 p-3 sm:p-5 flex flex-col gap-3 rounded-b-none sm:rounded-b-2xl z-10">
            
            {/* Balance & Win Row */}
            <div className="flex justify-between items-center px-4">
                <div className="flex flex-col text-left">
                    <span className="text-[10px] text-gray-400 font-bold tracking-wider">SALDO</span>
                    <span className="text-white font-mono font-bold text-sm sm:text-base">Rp {localBalance.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex flex-col text-center">
                    <span className="text-[10px] text-gray-400 font-bold tracking-wider">TARUHAN</span>
                    <span className="text-white font-mono font-bold text-sm sm:text-base">Rp {bet.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[10px] text-gray-400 font-bold tracking-wider">MENANG</span>
                    <span className="text-yellow-400 font-mono font-bold text-sm sm:text-base">Rp {(multiplierIdx > 0 ? (bet*15) : 0).toLocaleString('id-ID')}</span>
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex justify-center items-center mt-2 px-2 sm:px-6 gap-2 sm:gap-4">
                
                <button onClick={() => setBet(b => Math.max(banner.minBet, b - 1000))} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#ffb13b] text-[#ffb13b] flex items-center justify-center text-3xl font-light hover:bg-[#ffb13b]/20 hover:scale-105 active:scale-95 transition-all mb-4 shrink-0">-</button>
                
                {/* Big Spin Button */}
                <button 
                  onClick={handleSpin} disabled={isSpinning || localBalance < bet}
                  className={`relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-full flex flex-col items-center justify-center shrink-0 
                      shadow-[0_0_30px_rgba(0,0,0,1)] z-20 
                      ${isSpinning 
                          ? 'bg-gradient-to-b from-[#2a3b2a] to-[#121c12] cursor-not-allowed scale-[0.95] border-4 border-[#3c523c]' 
                          : 'bg-gradient-to-b from-[#4cd964] via-[#2cac40] to-[#165c22] border-[5px] sm:border-[6px] border-[#8ced9e] hover:brightness-110 active:scale-95 active:shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]'}
                      transition-all duration-200
                  `}
                >
                   <div className="absolute inset-1 rounded-full border-2 border-white/20"></div>
                   {isSpinning ? <Loader2 className="w-10 h-10 text-white/50 animate-spin" /> : (
                       <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
                           <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                       </svg>
                   )}
                </button>

                <button onClick={() => setBet(b => Math.min(localBalance, b + 1000))} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#ffb13b] text-[#ffb13b] flex items-center justify-center text-3xl font-light hover:bg-[#ffb13b]/20 hover:scale-105 active:scale-95 transition-all mb-4 shrink-0">+</button>
                
                <button 
                    onClick={() => setBet(localBalance)} 
                    className="h-9 sm:h-12 px-3 sm:px-4 rounded-full border-2 border-red-500 bg-red-900/50 text-red-500 hover:bg-red-500 hover:text-white font-black text-[10px] sm:text-sm tracking-widest transition-all mb-4 uppercase shrink-0"
                >ALL IN</button>
            </div>
        </div>

      </div>
    </div>
  );
};
