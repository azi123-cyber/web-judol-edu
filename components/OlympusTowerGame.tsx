import React, { useState, useEffect } from 'react';
import { X, HandCoins, Zap, Gem, CloudLightning } from 'lucide-react';
import { Banner, SpinResult, UserState } from '../types';

interface OlympusTowerGameProps {
  banner: Banner;
  user: UserState;
  onSpin: (cost: number, result: SpinResult) => void;
  onClose: () => void;
}

// Multipliers for an 8-level tower, 3 blocks, 1 bomb per row
const MULTIPLIERS = [1.42, 2.02, 2.88, 4.09, 5.82, 8.27, 11.77, 16.74, 25.0, 40.0];
const NUM_ROWS = 8;
const NUM_COLS = 3;

type TileStatus = 'hidden' | 'safe' | 'zonk' | 'skipped';

export const OlympusTowerGame: React.FC<OlympusTowerGameProps> = ({ banner, user, onSpin, onClose }) => {
  const [bet, setBet] = useState(banner.minBet);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'crashed' | 'cashedout'>('idle');
  
  const [currentRow, setCurrentRow] = useState(0); // 0 is bottom
  const [board, setBoard] = useState<TileStatus[][]>(
      Array.from({length: NUM_ROWS}, () => Array(NUM_COLS).fill('hidden'))
  );
  // Contains the column index of the bomb for each row
  const [bombs, setBombs] = useState<number[]>(Array(NUM_ROWS).fill(0));
  
  const currentMultiplier = currentRow === 0 ? 1 : MULTIPLIERS[currentRow - 1];
  const nextMultiplier = MULTIPLIERS[currentRow];

  // Efek visual pengurangan saldo 
  const [lossAnim, setLossAnim] = useState<number | null>(null);

  const generateBombs = () => {
    return Array.from({length: NUM_ROWS}, () => Math.floor(Math.random() * NUM_COLS));
  };

  const handleStart = () => {
    if (user.balance < bet) return;
    setBombs(generateBombs());
    setBoard(Array.from({length: NUM_ROWS}, () => Array(NUM_COLS).fill('hidden')));
    setGameState('playing');
    setCurrentRow(0);
    
    // Potong bet dari balance seketika via event minus 
    setLossAnim(bet);
    setTimeout(() => setLossAnim(null), 1000);
  };

  const handleTileClick = (r: number, c: number) => {
    if (gameState !== 'playing' || r !== currentRow) return;

    let isZonk = bombs[r] === c;

    // === SISTEM ALGORITMA LICIK TOWER OLYMPUS ===
    // Kalau user sudah main >= 3 kali, dan baris >= 1 (udah win 1), paksa zonk di langkah berikutnya!
    if (user.spinCount >= 2 && r >= 1 && !isZonk) {
       isZonk = true; // Curang paksa zonk agar tidak menang terus
       const newBombs = [...bombs];
       newBombs[r] = c;
       setBombs(newBombs);
    }

    const newBoard = [...board];
    if (isZonk) {
      newBoard[r][c] = 'zonk';
      // reveal sisanya 
      for(let i=0; i<NUM_COLS; i++) {
         if (i !== c) newBoard[r][i] = 'skipped';
      }
      setBoard(newBoard);
      setGameState('crashed');
      onSpin(bet, { type: 'ZONK', multiplier: 0, winAmount: 0, message: 'DISAMBAR ZEUS! RUNGKAD MASBRO!' });
    } else {
      newBoard[r][c] = 'safe';
      for(let i=0; i<NUM_COLS; i++) {
         if (i !== c) {
             if (bombs[r] === i) newBoard[r][i] = 'zonk';
             else newBoard[r][i] = 'skipped';
         }
      }
      setBoard(newBoard);
      
      if (r === NUM_ROWS - 1) {
          // Menang maksimal
          setGameState('cashedout');
          const win = Math.floor(bet * MULTIPLIERS[r]);
          onSpin(bet, { type: 'MAXWIN', multiplier: MULTIPLIERS[r], winAmount: win, message: `MAXWIN ZEUS! ${MULTIPLIERS[r]}x (+Rp ${win.toLocaleString('id-ID')})` });
      } else {
          setCurrentRow(r + 1);
      }
    }
  };

  const handleCashout = () => {
    if (gameState !== 'playing' || currentRow === 0) return;
    setGameState('cashedout');
    
    // Buka sisa bomb di tempat yg belum dimainkan (visual only)
    const newBoard = [...board];
    for(let r=currentRow; r<NUM_ROWS; r++) {
       newBoard[r][bombs[r]] = 'zonk';
       for(let c=0; c<NUM_COLS; c++) {
           if (bombs[r] !== c) newBoard[r][c] = 'skipped';
       }
    }
    setBoard(newBoard);

    const win = Math.floor(bet * currentMultiplier);
    onSpin(bet, {
      type: currentMultiplier >= 5 ? 'MEGA_WIN' : 'BIG_WIN',
      multiplier: currentMultiplier,
      winAmount: win,
      message: `CAIR! ${currentMultiplier}x (+Rp ${win.toLocaleString('id-ID')})`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-2 bg-black/95 backdrop-blur-md">
      <div className="bg-[#0f041c] border-0 md:border-2 border-yellow-500 rounded-none md:rounded-2xl w-full h-full md:h-auto max-w-4xl max-h-[100dvh] flex flex-col md:flex-row shadow-[0_0_80px_rgba(234,179,8,0.3)] overflow-y-auto md:overflow-hidden">
        
        {/* Sidebar Controls */}
        <div className="w-full md:w-80 bg-[#170529] p-5 flex flex-col border-b md:border-b-0 md:border-r border-[#3d1a5c] shrink-0">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-white font-black text-xl italic uppercase tracking-wider text-yellow-400 drop-shadow-[0_2px_2px_#000]">TOWER OF OLYMPUS</h2>
                   <div className="text-[10px] text-purple-400 font-mono">PRAGMATIC | GACOR</div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
            </div>

            <div className="bg-[#0f041c] p-3 rounded-lg mb-6 flex justify-between items-center border border-yellow-900 relative">
                <span className="text-gray-400 text-xs font-bold">SALDO</span>
                <span className="text-yellow-400 font-black font-mono relative">
                   Rp {user.balance.toLocaleString('id-ID')}
                   {lossAnim && (
                       <span className="absolute -top-6 right-0 text-red-500 text-sm font-black animate-[ping_1s_forwards] pointer-events-none drop-shadow-[0_0_5px_red]">
                          -Rp {lossAnim.toLocaleString('id-ID')}
                       </span>
                   )}
                </span>
            </div>

            {gameState === 'idle' || gameState === 'cashedout' || gameState === 'crashed' ? (
                <div className="space-y-4 md:space-y-5 flex-1 overflow-y-auto pb-4 md:pb-0">
                    <div>
                        <label className="text-xs text-purple-300 font-bold mb-2 block">AMOUNT (BET)</label>
                        <div className="flex items-center bg-[#08020f] border border-[#3d1a5c] rounded-lg p-1">
                            <input 
                                type="number" 
                                value={bet} 
                                onChange={e => setBet(Number(e.target.value))}
                                className="bg-transparent w-full p-2 text-white font-mono outline-none"
                            />
                            <div className="flex gap-1 pr-1">
                                <button onClick={() => setBet(b => Math.max(banner.minBet, b/2))} className="bg-[#3d1a5c] text-xs px-2 py-1 rounded text-purple-200">/2</button>
                                <button onClick={() => setBet(b => Math.min(user.balance, b*2))} className="bg-[#3d1a5c] text-xs px-2 py-1 rounded text-purple-200">x2</button>
                                <button onClick={() => setBet(user.balance)} className="bg-red-600 text-white font-black text-xs px-2 py-1 rounded hover:bg-red-500">ALL IN</button>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleStart} 
                        disabled={user.balance < bet || user.balance === 0}
                        className="w-full py-4 mt-4 rounded-xl font-black text-lg bg-gradient-to-b from-yellow-400 to-yellow-600 text-black shadow-[0_4px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none transition-all uppercase"
                    >
                        START CLIMB
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-end pt-4 md:pt-0">
                    <div className="bg-[#08020f] p-4 rounded-xl border border-yellow-900 mb-4 text-center">
                        <div className="text-gray-400 text-xs font-bold mb-1">TOTAL PROFIT</div>
                        <div className="text-4xl font-black text-yellow-400 font-mono drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">{(currentMultiplier).toFixed(2)}x</div>
                        <div className="text-green-500 font-bold">+Rp {Math.floor(bet * currentMultiplier).toLocaleString('id-ID')}</div>
                    </div>

                    <div className="bg-[#08020f] p-3 rounded-xl border border-[#3d1a5c] mb-4 flex justify-between items-center text-xs">
                        <span className="text-purple-300">Next Step:</span>
                        <span className="text-yellow-500 font-bold">{(nextMultiplier).toFixed(2)}x</span>
                    </div>

                    <button 
                        onClick={handleCashout}
                        disabled={currentRow === 0}
                        className={`w-full py-5 rounded-xl font-black text-xl flex items-center justify-center gap-2 uppercase transition-all ${
                            currentRow === 0 
                            ? 'bg-[#1c082b] border border-[#3d1a5c] text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-b from-green-400 to-green-600 border-2 border-white text-black shadow-[0_4px_0_rgb(22,101,52)] active:translate-y-1 active:shadow-none animate-[pulse_1.5s_infinite]'
                        }`}
                    >
                        <HandCoins size={24}/> Cash Out
                    </button>
                </div>
            )}
        </div>

        {/* Right Play Area (Tower) */}
        <div className="flex-1 bg-[#1a082e] p-2 md:p-6 flex flex-col items-center justify-center relative min-h-[400px]">
            
            <div className="absolute top-4 right-4 text-[10px] text-yellow-500/50 font-mono flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-yellow-500/30">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                PROVABLY FAIR SYSTEM
            </div>

            <div className="w-full max-w-[350px] flex flex-col-reverse gap-2">
                {board.map((row, rIdx) => {
                    const isCurrent = rIdx === currentRow && gameState === 'playing';
                    const isPast = rIdx < currentRow && gameState === 'playing';
                    
                    return (
                        <div key={rIdx} className={`flex gap-2 w-full transition-all duration-300 ${isCurrent ? 'scale-105 my-1' : 'opacity-80 scale-100'}`}>
                            {row.map((tile, cIdx) => (
                                <button 
                                    key={cIdx}
                                    disabled={!isCurrent || tile !== 'hidden'}
                                    onClick={() => handleTileClick(rIdx, cIdx)}
                                    className={`flex-1 h-12 md:h-14 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center border-b-4 relative overflow-hidden
                                        ${tile === 'hidden' && isCurrent ? 'bg-[#3d1a5c] border-[#290d42] hover:bg-[#522978] cursor-pointer hover:-translate-y-1' : ''}
                                        ${tile === 'hidden' && !isCurrent ? 'bg-[#29133b] border-[#1c0d2b] cursor-not-allowed opacity-60' : ''}
                                        ${tile === 'safe' ? 'bg-gradient-to-b from-yellow-500 to-yellow-700 border-[#8a6a1c] !border-b-0 translate-y-1' : ''}
                                        ${tile === 'zonk' ? 'bg-gradient-to-b from-red-600 to-red-900 border-[#4a0d0d] !border-b-0 translate-y-1' : ''}
                                        ${tile === 'skipped' ? 'bg-[#140624] border-[#0a0312] opacity-40' : ''}
                                    `}
                                >
                                    {tile === 'safe' && <span className="absolute text-yellow-100 font-black text-sm drop-shadow-[0_2px_2px_#000]">{MULTIPLIERS[rIdx]}x</span>}
                                    {tile === 'zonk' && <CloudLightning className="text-white w-8 h-8 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />}
                                    
                                    {/* Efek menyala pas isCurrent */}
                                    {isCurrent && tile === 'hidden' && <div className="absolute inset-0 bg-yellow-400/10 animate-pulse"></div>}
                                </button>
                            ))}
                        </div>
                    )
                })}
            </div>

            {/* Overlays */}
            {gameState === 'crashed' && (
                <div className="absolute inset-0 bg-red-900/40 pointer-events-none flex flex-col items-center justify-center animate-in fade-in backdrop-blur-[2px]">
                    <CloudLightning className="text-red-500 w-32 h-32 mb-4 drop-shadow-[0_0_50px_red] animate-bounce"/>
                    <div className="bg-gradient-to-r from-red-600 to-red-800 border-4 border-black text-white font-black text-3xl md:text-5xl px-8 py-4 rounded-lg shadow-[0_0_50px_rgba(220,38,38,1)] text-center uppercase tracking-widest" style={{WebkitTextStroke: '2px black'}}>MURKA ZEUS!</div>
                </div>
            )}
            {gameState === 'cashedout' && (
                <div className="absolute inset-0 bg-yellow-900/40 pointer-events-none flex items-center justify-center animate-in fade-in backdrop-blur-[2px]">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 border-4 border-black text-black font-black text-4xl px-8 py-4 rounded-lg shadow-[0_0_50px_rgba(234,179,8,0.8)] uppercase rotate-[-5deg]">W.D: {(currentMultiplier).toFixed(2)}x</div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
