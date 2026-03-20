import React, { useState, useCallback, useEffect } from 'react';
import { X, Bomb, Gem, HandCoins } from 'lucide-react';
import { Banner, SpinResult, UserState } from '../types';

interface MinesGameProps {
  banner: Banner;
  user: UserState;
  onSpin: (cost: number, result: SpinResult) => void;
  onClose: () => void;
}

type TileStatus = 'hidden' | 'gem' | 'mine';

// Rumus perkiraan multiplier Mines standar
const calculateMultiplier = (minesConfig: number, safeHits: number): number => {
  let mult = 1.0;
  let remainingTiles = 25;
  let remainingSafe = 25 - minesConfig;
  for (let i = 0; i < safeHits; i++) {
    mult *= (remainingTiles / remainingSafe);
    remainingTiles--;
    remainingSafe--;
  }
  return Number((mult * 0.96).toFixed(2)); // House edge ~4%
};

const generateBoard = (minesConfig: number) => {
  const b = Array(25).fill('gem');
  let placed = 0;
  while (placed < minesConfig) {
    const idx = Math.floor(Math.random() * 25);
    if (b[idx] !== 'mine') {
      b[idx] = 'mine';
      placed++;
    }
  }
  return b;
};

export const MinesGame: React.FC<MinesGameProps> = ({ banner, user, onSpin, onClose }) => {
  const [bet, setBet] = useState(banner.minBet);
  const [numMines, setNumMines] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'crashed' | 'cashedout'>('idle');
  const [board, setBoard] = useState<TileStatus[]>(Array(25).fill('hidden'));
  const [actualBoard, setActualBoard] = useState<TileStatus[]>(Array(25).fill('gem'));
  const [safeHits, setSafeHits] = useState(0);
  const [lossAnim, setLossAnim] = useState<number | null>(null);

  const currentMultiplier = safeHits === 0 ? 1 : calculateMultiplier(numMines, safeHits);
  const nextMultiplier = calculateMultiplier(numMines, safeHits + 1);

  const handleStart = () => {
    if (user.balance < bet) return;
    setActualBoard(generateBoard(numMines));
    setBoard(Array(25).fill('hidden'));
    setGameState('playing');
    setSafeHits(0);
    setLossAnim(bet);
    setTimeout(() => setLossAnim(null), 1000);
    // Kita panggil onSpin kosong untuk memotong balance (simulasi bet dimuka)
    // Tapi karena arsitektur App.tsx mengharapkan result di akhir, kita tahan onSpin sampai game over atau cashout.
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing' || board[index] !== 'hidden') return;

    let isMine = actualBoard[index] === 'mine';

    // === SISTEM KECURANGAN BERSYARAT (HONEYPOT ALGORITHM) ===
    // Spin 1 & 2: Biarkan user main normal/agak hoki.
    // Spin 3 dst: Jika user udah klik 2 kotak aman, kotak KE-3 PASTI JADI BOM meskipun aslinya Gem!
    if (user.spinCount >= 2 && safeHits >= 2 && !isMine) {
       // Paksa jadi bom
       isMine = true;
    }

    const newBoard = [...board];
    if (isMine) {
      // Buka semua
      for(let i=0; i<25; i++) {
        if(actualBoard[i] === 'mine') newBoard[i] = 'mine';
        else if (newBoard[i] === 'hidden') newBoard[i] = 'gem'; // reveal sisanya dengan gaya pudar
      }
      newBoard[index] = 'mine'; // Yg diklik pasti meledak
      setBoard(newBoard);
      setGameState('crashed');
      onSpin(bet, { type: 'ZONK', multiplier: 0, winAmount: 0, message: 'DUAAR!!! KENA RANJAU BOZKUUH!' });
    } else {
      newBoard[index] = 'gem';
      setBoard(newBoard);
      setSafeHits(prev => prev + 1);
    }
  };

  const handleCashout = () => {
    if (gameState !== 'playing' || safeHits === 0) return;
    // Buka sisa board (transparan)
    const newBoard = [...board];
    for(let i=0; i<25; i++) {
        if(actualBoard[i] === 'mine') newBoard[i] = 'mine';
    }
    setBoard(newBoard);
    setGameState('cashedout');
    
    const win = Math.floor(bet * currentMultiplier);
    onSpin(bet, {
      type: currentMultiplier >= 5 ? 'MEGA_WIN' : 'BIG_WIN',
      multiplier: currentMultiplier,
      winAmount: win,
      message: `CAIR! ${currentMultiplier}x (+Rp ${win.toLocaleString('id-ID')})`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/95 backdrop-blur-md">
      <div className="bg-[#0f1923] border border-blue-500/30 rounded-2xl w-full max-w-4xl flex flex-col md:flex-row shadow-[0_0_80px_rgba(37,99,235,0.2)] overflow-hidden h-[90vh] md:h-auto">
        
        {/* Left Sidebar (Controls) */}
        <div className="w-full md:w-80 bg-[#1f2933] p-5 flex flex-col border-b md:border-b-0 md:border-r border-gray-800 shrink-0">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-white font-black text-xl italic uppercase tracking-wider">MINES</h2>
                   <div className="text-[10px] text-blue-400 font-mono">SPRIBE | GACOR</div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
            </div>

            <div className="bg-[#0f1923] p-3 rounded-lg mb-6 flex justify-between items-center border border-gray-800 relative">
                <span className="text-gray-500 text-xs font-bold">SALDO</span>
                <span className="text-green-400 font-black font-mono relative">
                    Rp {user.balance.toLocaleString('id-ID')}
                    {lossAnim && (
                        <span className="absolute -top-6 right-0 text-red-500 text-sm font-black animate-[ping_1s_forwards] pointer-events-none drop-shadow-[0_0_5px_red]">
                           -Rp {lossAnim.toLocaleString('id-ID')}
                        </span>
                    )}
                </span>
            </div>

            {gameState === 'idle' || gameState === 'cashedout' || gameState === 'crashed' ? (
                <div className="space-y-5 flex-1 overflow-y-auto">
                    <div>
                        <label className="text-xs text-gray-400 font-bold mb-2 block">AMOUNT (BET)</label>
                        <div className="flex items-center bg-[#0a1118] border border-gray-700 rounded-lg p-1">
                            <input 
                                type="number" 
                                value={bet} 
                                onChange={e => setBet(Number(e.target.value))}
                                className="bg-transparent w-full p-2 text-white font-mono outline-none"
                            />
                            <div className="flex gap-1 pr-1">
                                <button onClick={() => setBet(b => Math.max(banner.minBet, b/2))} className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-300">/2</button>
                                <button onClick={() => setBet(b => Math.min(user.balance, b*2))} className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-300">x2</button>
                                <button onClick={() => setBet(user.balance)} className="bg-red-600 text-white font-black text-xs px-2 py-1 rounded hover:bg-red-500">ALL IN</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 font-bold mb-2 block">MINES</label>
                        <select 
                            value={numMines} onChange={e => setNumMines(Number(e.target.value))}
                            className="w-full bg-[#0a1118] border border-gray-700 rounded-lg p-3 text-white font-mono outline-none appearance-none"
                        >
                            <option value={1}>1 Mine</option>
                            <option value={3}>3 Mines</option>
                            <option value={5}>5 Mines</option>
                            <option value={10}>10 Mines</option>
                            <option value={20}>20 Mines</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleStart} 
                        disabled={user.balance < bet}
                        className="w-full py-4 mt-4 rounded-xl font-black text-lg bg-green-500 hover:bg-green-400 text-black shadow-[0_4px_0_rgb(22,101,52)] active:translate-y-1 active:shadow-none transition-all uppercase"
                    >
                        BET
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-end">
                    <div className="bg-[#0a1118] p-4 rounded-xl border border-gray-700 mb-4 text-center">
                        <div className="text-gray-400 text-xs font-bold mb-1">TOTAL PROFIT</div>
                        <div className="text-3xl font-black text-green-400 font-mono">{(currentMultiplier).toFixed(2)}x</div>
                        <div className="text-green-500 font-bold">+Rp {Math.floor(bet * currentMultiplier).toLocaleString('id-ID')}</div>
                    </div>

                    <div className="bg-[#0a1118] p-3 rounded-xl border border-gray-800 mb-4 flex justify-between items-center text-xs">
                        <span className="text-gray-500">Next Tile Profit:</span>
                        <span className="text-yellow-500 font-bold">{(nextMultiplier).toFixed(2)}x</span>
                    </div>

                    <button 
                        onClick={handleCashout}
                        disabled={safeHits === 0}
                        className={`w-full py-5 rounded-xl font-black text-xl flex items-center justify-center gap-2 uppercase transition-all ${
                            safeHits === 0 
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                            : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_4px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none animate-pulse'
                        }`}
                    >
                        <HandCoins size={24}/> Cash Out
                    </button>
                </div>
            )}
        </div>

        {/* Right Play Area */}
        <div className="flex-1 bg-[#101b26] p-6 flex flex-col items-center justify-center relative overflow-y-auto min-h-[400px]">
            {/* Provably fair mock text */}
            <div className="absolute top-4 right-4 text-[10px] text-gray-700 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                PROVABLY FAIR SYSTEM
            </div>

            <div className="grid grid-cols-5 gap-2 md:gap-3 w-full max-w-[400px]">
                {board.map((tile, i) => {
                    const isGameOver = gameState === 'crashed' || gameState === 'cashedout';
                    return (
                        <button 
                            key={i}
                            disabled={gameState !== 'playing' || tile !== 'hidden'}
                            onClick={() => handleTileClick(i)}
                            className={`aspect-square rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center border-b-4
                                ${tile === 'hidden' && gameState === 'playing' ? 'bg-[#2a3a4a] border-[#1d2936] hover:bg-[#34485c] cursor-pointer hover:-translate-y-1' : ''}
                                ${tile === 'hidden' && isGameOver ? 'bg-[#1f2933] border-[#131a20] opacity-50 cursor-not-allowed' : ''}
                                ${tile === 'gem' ? 'bg-[#132820] border-[#0a1812] !border-b-0 translate-y-1' : ''}
                                ${tile === 'mine' ? 'bg-[#401313] border-[#290a0a] !border-b-0 translate-y-1' : ''}
                            `}
                        >
                            <div className="scale-0 transition-transform duration-300" style={{ transform: tile !== 'hidden' ? 'scale(1)' : 'scale(0)'}}>
                                {tile === 'gem' && <Gem className="text-green-400 w-8 h-8 md:w-12 md:h-12 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />}
                                {tile === 'mine' && <Bomb className="text-red-500 w-10 h-10 md:w-14 md:h-14 animate-bounce" />}
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* End Game Overlays */}
            {gameState === 'crashed' && (
                <div className="absolute inset-0 bg-red-900/20 pointer-events-none flex items-center justify-center animate-in fade-in">
                    <div className="bg-red-600 text-white font-black text-4xl italic px-8 py-3 rounded-lg rotate-[-10deg] shadow-[0_0_50px_rgba(220,38,38,0.8)] uppercase">MELEDAK!</div>
                </div>
            )}
            {gameState === 'cashedout' && (
                <div className="absolute inset-0 bg-green-900/20 pointer-events-none flex items-center justify-center animate-in fade-in">
                    <div className="bg-green-500 text-black font-black text-4xl italic px-8 py-3 rounded-lg rotate-[-5deg] shadow-[0_0_50px_rgba(34,197,94,0.8)] uppercase">WD: {(currentMultiplier).toFixed(2)}x</div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
