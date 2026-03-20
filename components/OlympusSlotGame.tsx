import React, { useState, useEffect } from 'react';
import { X, Info, Volume2, Plus, Minus, RotateCw, Settings } from 'lucide-react';
import { Banner, SpinResult, UserState } from '../types';

interface OlympusSlotGameProps {
  banner: Banner;
  user: UserState;
  onSpin: (cost: number, result: SpinResult) => void;
  onClose: () => void;
}

const SYMBOLS = ['💎', '💚', '💙', '💜', '❤️', '🏆', '💍', '⏳', '👑', '⚡'];

const NUM_COLS = 6;
const NUM_ROWS = 5;

const generateGrid = () => {
    return Array.from({length: NUM_COLS}, () => 
        Array.from({length: NUM_ROWS}, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
    );
};

export const OlympusSlotGame: React.FC<OlympusSlotGameProps> = ({ banner, user, onSpin, onClose }) => {
  const [bet, setBet] = useState(banner.minBet);
  const [isSpinning, setIsSpinning] = useState(false);
  const [grid, setGrid] = useState<string[][]>(generateGrid());
  const [winAnim, setWinAnim] = useState<number | null>(null);
  const [localBalance, setLocalBalance] = useState(user.balance);

  useEffect(() => {
    if (!isSpinning) {
       setLocalBalance(user.balance);
    }
  }, [user.balance, isSpinning]);

  const handleSpin = () => {
    if (localBalance < bet || isSpinning) return;
    setIsSpinning(true);
    setLocalBalance(prev => prev - bet);
    setWinAnim(null);

    let spins = 0;
    const interval = setInterval(() => {
        setGrid(generateGrid());
        spins++;
        if (spins > 10) {
            clearInterval(interval);
            finishSpin();
        }
    }, 100);
  };

  const finishSpin = () => {
    const isWin = (user.spinCount % 3 === 0) && user.spinCount > 0;
    const finalGrid = generateGrid();
    
    if (isWin) {
       // Force some Zeus Scatters
       finalGrid[0][2] = '⚡';
       finalGrid[2][1] = '⚡';
       finalGrid[4][3] = '⚡';
       finalGrid[5][0] = '⚡';
       setGrid(finalGrid);
       
       setTimeout(() => {
           const winAmount = bet * 25;
           setWinAnim(winAmount);
           onSpin(bet, {
              type: 'MEGA_WIN', 
              multiplier: 25, 
              winAmount, 
              message: `SCATTER HIT! +Rp ${winAmount.toLocaleString('id-ID')}`
           });
           setIsSpinning(false);
       }, 500);
    } else {
       setGrid(finalGrid);
       setTimeout(() => {
           onSpin(bet, { type: 'ZONK', multiplier: 0, winAmount: 0, message: 'DISAMBAR ZEUS!' });
           setIsSpinning(false);
       }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-black/95 backdrop-blur-sm sm:p-4">
      {/* Main Container */}
      <div className="w-full max-w-[1000px] h-full sm:aspect-video sm:h-auto sm:max-h-[90dvh] relative overflow-hidden flex flex-col 
                      bg-[url('https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center 
                      sm:rounded-[2rem] border-0 sm:border-4 border-[#ffcc00] shadow-[0_0_50px_rgba(255,204,0,0.4)]">
        
        {/* Purple haze overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4a0d8a]/60 via-transparent to-[#280552]/80 pointer-events-none"></div>

        {/* Top Header */}
        <div className="w-full h-10 flex flex-row-reverse sm:h-0 z-50">
           <button onClick={onClose} className="m-2 text-white/50 hover:text-white transition-colors bg-black/50 rounded-full p-1"><X size={24}/></button>
        </div>

        {/* Desktop Close Button (hidden on mobile header) */}
        <button onClick={onClose} className="hidden sm:block absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-50 bg-black/50 rounded-full p-2"><X size={24}/></button>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 px-2 sm:px-6 relative z-10 w-full max-w-[950px] mx-auto pt-6 sm:pt-0 pb-20 sm:pb-0">

            {/* Left Panel Removed as requested */}

            {/* Main Play Area */}
            <div className="flex-1 w-full max-w-2xl flex flex-col relative aspect-[6/5] sm:aspect-auto sm:h-full justify-center">

                 {/* Win Info Bar */}
                 <div className="absolute -top-12 sm:top-[2%] left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#4a0d0d] to-transparent w-full text-center py-1 sm:py-2 z-20">
                     <div className="inline-block bg-[#1a0505]/80 border-t-2 border-b-2 border-red-500/50 px-8 py-1 rounded-[100%] shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                         <span className="text-white font-black uppercase text-sm sm:text-base drop-shadow-[0_2px_2px_#000]">
                            {winAnim ? `TUMBLE WIN Rp ${winAnim.toLocaleString('id-ID')}` : 'GATES OF OLYMPUS'}
                         </span>
                     </div>
                 </div>

                 {/* The Golden Frame Grid */}
                 <div className="w-full bg-[#2b0c36]/90 rounded-xl border-[6px] border-[#ffcc00] shadow-[0_0_20px_#ffcc00,inset_0_0_30px_#000] p-1.5 sm:p-2 z-10 relative box-border">
                     
                     {/* Frame Corner Ornaments */}
                     <div className="absolute -top-[14px] -left-[14px] w-8 h-8 sm:w-10 sm:h-10 border-[6px] border-[#ffcc00] rounded-tl-xl border-b-transparent border-r-transparent pointer-events-none"></div>
                     <div className="absolute -top-[14px] -right-[14px] w-8 h-8 sm:w-10 sm:h-10 border-[6px] border-[#ffcc00] rounded-tr-xl border-b-transparent border-l-transparent pointer-events-none"></div>
                     <div className="absolute -bottom-[14px] -left-[14px] w-8 h-8 sm:w-10 sm:h-10 border-[6px] border-[#ffcc00] rounded-bl-xl border-t-transparent border-r-transparent pointer-events-none"></div>
                     <div className="absolute -bottom-[14px] -right-[14px] w-8 h-8 sm:w-10 sm:h-10 border-[6px] border-[#ffcc00] rounded-br-xl border-t-transparent border-l-transparent pointer-events-none"></div>

                     {/* The Tiles Display */}
                     <div className="w-full h-full flex justify-between gap-1 overflow-hidden pointer-events-none">
                         {grid.map((col, colIdx) => (
                             <div key={colIdx} className="flex flex-col justify-between w-full relative">
                                 {/* Vertical separator lines */}
                                 {colIdx > 0 && <div className="absolute -left-[4px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#ffcc00]/30 to-transparent"></div>}
                                 
                                 {col.map((tile, rowIdx) => {
                                     const isScatter = tile === '⚡';
                                     const isCrown = tile === '👑';
                                     return (
                                         <div key={`${colIdx}-${rowIdx}`} className={`
                                            w-full aspect-square flex items-center justify-center transition-all duration-100 ease-in-out
                                            ${isSpinning ? 'opacity-50 blur-[2px] translate-y-[-20px]' : 'opacity-100 blur-0 translate-y-0 text-[1.5rem] sm:text-[3.5rem]'}
                                         `}>
                                            <span style={{filter: isScatter ? 'drop-shadow(0 0 10px #ffcc00)' : 'drop-shadow(0 5px 5px rgba(0,0,0,0.5))'}} className={`
                                                ${isScatter ? 'scale-[1.2] pb-2 text-[2rem] sm:text-[4rem] animate-pulse z-10' : ''}
                                                ${isCrown ? 'scale-[1.1]' : ''}
                                            `}>
                                                {isScatter ? <div className="flex flex-col items-center"><span className="leading-none">{tile}</span><span className="text-[0.25em] text-[#ffcc00] font-black uppercase tracking-widest bg-black/60 px-1 rounded absolute bottom-0 font-sans border border-[#ffcc00]/50">SCATTER</span></div> : tile}
                                            </span>
                                         </div>
                                     )
                                 })}
                             </div>
                         ))}
                     </div>

                     {/* Right side Zeus Character Graphic (Fake) */}
                     {/* In a real scenario, this would be an image of Zeus floating beside the board. We simulate it structurally. */}
                 </div>
            </div>

            {/* Zeus Presence Placeholder on desktop */}
            <div className="hidden sm:block absolute right-0 top-[15%] bottom-0 w-[15vw] max-w-[200px] pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Statue_of_Zeus_%28Hermitage%29.jpg')] bg-contain bg-right-bottom bg-no-repeat opacity-30 mix-blend-luminosity z-0" style={{WebkitMaskImage: 'linear-gradient(to right, transparent, black)'}}></div>

        </div>

        {/* Global Bottom Control Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[8vh] min-h-[50px] sm:h-16 bg-gradient-to-r from-black via-black/90 to-black/80 backdrop-blur-md border-t-2 border-[#ffcc00]/50 flex items-center justify-between px-2 sm:px-6 z-50">
            
            {/* Left Menus (Removed Dummy Buttons) */}
            <div className="flex items-center gap-1 sm:gap-4 h-full">
                {/* Balance & Bet Info */}
                <div className="flex flex-col ml-1 sm:ml-4 select-none">
                    <span className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-widest uppercase">Credit <span className="text-white text-[10px] sm:text-xs">Rp {localBalance.toLocaleString('id-ID')}</span></span>
                    <span className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-widest uppercase">Bet <span className="text-white text-[10px] sm:text-xs">Rp {bet.toLocaleString('id-ID')}</span></span>
                </div>
            </div>

            {/* Mid Win Message (Desktop) */}
            {winAnim && (
               <div className="hidden sm:flex flex-col items-center">
                   <div className="text-[10px] text-yellow-500 font-black uppercase tracking-widest mb-[-4px]">WIN</div>
                   <div className="text-xl font-black text-white">$ {(winAnim).toLocaleString('id-ID')}</div>
               </div>
            )}

            {/* Right Spin Controls */}
            <div className="flex items-center gap-2 sm:gap-4 h-full relative">
                <button onClick={() => setBet(localBalance)} className="h-6 sm:h-8 px-2 sm:px-3 rounded-full border border-red-500 bg-red-900/50 text-red-500 hover:bg-red-500 hover:text-white font-black text-[8px] sm:text-[10px] tracking-widest transition-all uppercase shrink-0">ALL IN</button>

                <button onClick={() => setBet(b => Math.max(banner.minBet, b - 200))} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-transparent border-2 border-transparent hover:bg-white/10 text-white font-light text-xl transition-colors shrink-0">
                    <Minus size={16} className="sm:w-5 sm:h-5"/>
                </button>
                
                <div className="relative flex flex-col items-center justify-center group h-full cursor-pointer" onClick={handleSpin}>
                    <button 
                      disabled={isSpinning || localBalance < bet}
                      className={`relative w-12 h-12 sm:w-[70px] sm:-mt-6 sm:h-[70px] rounded-full flex flex-col items-center justify-center shrink-0 
                          shadow-[0_0_20px_rgba(255,255,255,0.2)] z-20 
                          ${isSpinning 
                              ? 'bg-gradient-to-b from-[#2a3b2a] to-[#121c12] cursor-not-allowed border-4 border-[#3c523c]' 
                              : 'bg-gradient-to-b from-[#1a1a1a] via-[#333] to-[#0a0a0a] border-4 border-white/20 hover:border-white/40 active:scale-95'}
                          transition-all duration-200
                      `}
                    >
                       <RotateCw size={24} strokeWidth={3} className={`text-white drop-shadow-[0_2px_2px_#000] sm:w-8 sm:h-8 ${isSpinning ? 'animate-spin opacity-50' : ''}`} />
                       <span className="absolute -bottom-4 text-[9px] uppercase font-black text-white/50 group-hover:text-white transition-colors tracking-widest hidden sm:block">AUTOPLAY</span>
                    </button>
                    {/* Mobile auto label */}
                    <span className="text-[7px] uppercase font-bold text-white/50 tracking-widest mt-0.5 sm:hidden">AUTO</span>
                </div>

                <button onClick={() => setBet(b => Math.min(localBalance, b + 200))} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-transparent border-2 border-transparent hover:bg-white/10 text-white font-light text-xl transition-colors shrink-0">
                    <Plus size={16} className="sm:w-5 sm:h-5"/>
                </button>
            </div>
            
        </div>

      </div>
    </div>
  );
};
