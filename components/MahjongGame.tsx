import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { Banner, SpinResult, UserState } from '../types';

interface MahjongGameProps {
  banner: Banner;
  user: UserState;
  onSpin: (cost: number, result: SpinResult) => void;
  onClose: () => void;
}

// Emoji Standar Universal agar OS Linux tidak ngeblank
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
  const [lossAnim, setLossAnim] = useState<number | null>(null);
  const MULTIPLIERS = [1, 2, 3, 5];

  const handleSpin = () => {
    if (user.balance < bet || isSpinning) return;
    setIsSpinning(true);
    setMultiplierIdx(0);
    setLossAnim(bet);
    setTimeout(() => setLossAnim(null), 1000);

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
    const isWin = user.spinCount < 3;
    const finalReels = generateReels();
    
    if (isWin) {
       const winTile = '🐉';
       finalReels[0][1] = winTile;
       finalReels[1][2] = winTile;
       finalReels[2][2] = winTile;
       finalReels[3][2] = winTile;
       finalReels[4][1] = winTile;
       setReels(finalReels);
       
       setTimeout(() => {
           setMultiplierIdx(1);
       }, 800);
       setTimeout(() => {
           setMultiplierIdx(3);
           const winAmount = bet * 15;
           onSpin(bet, {
              type: 'MEGA_WIN', 
              multiplier: 15, 
              winAmount, 
              message: `SCATTER HIT! +Rp ${winAmount.toLocaleString('id-ID')}`
           });
           setIsSpinning(false);
       }, 1600);
    } else {
       finalReels[0][0] = '🧧'; finalReels[1][0] = '🏮'; finalReels[2][0] = '💮';
       setReels(finalReels);
       
       setTimeout(() => {
           onSpin(bet, {
             type: 'ZONK',
             multiplier: 0,
             winAmount: 0,
             message: 'RUNGKAD! SALDO KESEDOT BANDAR!'
           });
           setIsSpinning(false);
       }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/95">
      <div className="bg-[#0b2114] w-full max-w-sm md:max-w-md h-full md:h-auto max-h-[100dvh] rounded-none md:rounded-3xl border-2 border-[#194026] relative overflow-y-auto md:overflow-hidden flex flex-col items-center">
        
        <div className="w-full bg-[#07140c] text-center py-2 flex justify-between px-4 items-center">
             <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20}/></button>
             <h3 className="text-[#a49a88] text-sm font-black tracking-widest uppercase">Mahjong Ways 2</h3>
             <div className="text-green-500"><User size={16}/></div>
        </div>

        <div className="w-full bg-gradient-to-b from-[#255034] to-[#0f2416] py-3 px-2 flex justify-center gap-2 border-b-2 border-yellow-600/30">
            {MULTIPLIERS.map((m, i) => (
                <div key={m} className={`w-12 h-12 flex items-center justify-center rounded-lg font-black text-xl transition-all duration-300
                    ${i === multiplierIdx 
                        ? 'bg-gradient-to-b from-yellow-300 to-yellow-600 text-black scale-110 shadow-[0_0_15px_rgba(234,179,8,1)] border-2 border-white' 
                        : 'bg-[#0f2416] text-[#4d735b] border border-[#255034]'}
                `}>
                   x{m}
                </div>
            ))}
        </div>

        <div className="flex-1 w-full bg-[#112d1b] flex items-center justify-center relative p-4">
            
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-overlay"></div>

            <div className="flex gap-1 items-center relative z-10">
                {reels.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-1">
                        {col.map((tile, rowIdx) => {
                            const isGold = (colIdx > 0 && colIdx < 4) && (rowIdx === 2 || rowIdx === 3);
                            return (
                                <div key={`${colIdx}-${rowIdx}`} className={`
                                    w-12 h-14 md:w-16 md:h-16 rounded-lg border-b-4 flex flex-col items-center justify-center transition-all duration-100 ease-in-out
                                    ${isGold 
                                        ? 'bg-gradient-to-b from-yellow-200 to-yellow-500 border-yellow-700 shadow-[0_2px_10px_rgba(234,179,8,0.5)]' 
                                        : 'bg-gradient-to-b from-[#e3e1d6] to-[#b3b0a1] border-[#8a8677] shadow-md'}
                                    ${isSpinning ? 'opacity-80 scale-95 blur-[1px]' : 'opacity-100 scale-100 blur-0'}
                                `}>
                                    <span style={{filter: isGold ? 'sepia(1) hue-rotate(-30deg) saturate(3)' : 'none'}} className={`text-3xl md:text-4xl ${isGold ? 'drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]' : 'text-green-900'}`}>{tile}</span>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            <div className="absolute top-2 left-2 text-[8px] text-green-700/50 font-mono">
                [RIGGED SYSTEM v2.0]
            </div>
        </div>

        <div className="w-full bg-[#08170e] p-4 flex flex-col gap-4 border-t-2 border-yellow-600/30 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center bg-[#0d2214] border border-[#1b3d26] rounded-full px-4 py-2">
                <div className="flex flex-col">
                    <span className="text-[10px] text-yellow-600 font-bold">SALDO</span>
                    <span className="text-green-400 font-black font-mono tracking-wider relative">
                        Rp {user.balance.toLocaleString('id-ID')}
                        {lossAnim && (
                           <span className="absolute -top-6 right-0 text-red-500 text-sm font-black animate-[ping_1s_forwards] pointer-events-none drop-shadow-[0_0_5px_red]">
                              -Rp {lossAnim.toLocaleString('id-ID')}
                           </span>
                        )}
                    </span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[10px] text-yellow-600 font-bold">WIN</span>
                    <span className="text-yellow-400 font-black font-mono tracking-wider">Rp {(multiplierIdx > 0 ? (bet*15) : 0).toLocaleString('id-ID')}</span>
                </div>
            </div>

            <div className="flex justify-between items-center gap-4">
                <div className="flex-1 flex flex-col">
                   <div className="flex justify-between text-[10px] text-[#4d735b] font-bold mb-1 px-2">
                       <span>MIN {banner.minBet / 1000}K</span>
                       <span>TICKET</span>
                   </div>
                   <div className="flex items-center justify-between bg-[#0d2214] border border-[#255034] rounded-full overflow-hidden shrink-0">
                       <button onClick={() => setBet(b => Math.max(banner.minBet, b - 1000))} className="px-3 py-2 text-red-500 hover:bg-black/30 font-black text-xl leading-none">-</button>
                       <span className="font-mono text-white font-bold">{bet.toLocaleString('id-ID')}</span>
                       <button onClick={() => setBet(b => Math.min(user.balance, b + 1000))} className="px-3 py-2 text-green-500 hover:bg-black/30 font-black text-xl leading-none">+</button>
                       <button onClick={() => setBet(user.balance)} className="bg-red-600 text-white font-black text-[9px] px-2 py-3 hover:bg-red-500 leading-none">ALL IN</button>
                   </div>
                </div>

                <button 
                  onClick={handleSpin} disabled={isSpinning || user.balance < bet}
                  className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center shrink-0 border-4 border-[#0d2214] shadow-[0_0_20px_rgba(34,197,94,0.3)]
                      ${isSpinning 
                          ? 'bg-[#1b3d26] cursor-not-allowed scale-95' 
                          : 'bg-gradient-to-b from-green-400 to-green-700 hover:scale-105 active:scale-95'}
                      transition-all duration-200
                  `}
                >
                   <div className="absolute inset-2 rounded-full border border-green-300/30"></div>
                   <span className="text-black font-black text-xl relative z-10">SPIN</span>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};
