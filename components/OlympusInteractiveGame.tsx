import React, { useState } from 'react';
import { X, HandCoins, Zap, Gem } from 'lucide-react';
import { Banner, SpinResult, UserState } from '../types';

interface OlympusInterGameProps {
  banner: Banner;
  user: UserState;
  onSpin: (cost: number, result: SpinResult) => void;
  onClose: () => void;
}

type TileStatus = 'hidden' | 'multiplier' | 'zonk';

// Game Olympus Interaktif (Gaya Mines)
export const OlympusInteractiveGame: React.FC<OlympusInterGameProps> = ({ banner, user, onSpin, onClose }) => {
  const [bet, setBet] = useState(banner.minBet);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'crashed' | 'cashedout'>('idle');
  
  // 36 Tiles (6x6 Grid for Olympus feel)
  const [board, setBoard] = useState<TileStatus[]>(Array(36).fill('hidden'));
  const [actualBoard, setActualBoard] = useState<TileStatus[]>(Array(36).fill('multiplier'));
  const [safeHits, setSafeHits] = useState(0);

  // Semakin banyak hits, semakin besar multiplier (exponent)
  const currentMultiplier = safeHits === 0 ? 1 : Number((Math.pow(1.15, safeHits)).toFixed(2));
  const nextMultiplier = Number((Math.pow(1.15, safeHits + 1)).toFixed(2));

  const generateBoard = () => {
    const b = Array(36).fill('multiplier');
    // Zeus (Zonks) - kita taruh 8 petir zeus
    let placed = 0;
    while (placed < 8) {
      const idx = Math.floor(Math.random() * 36);
      if (b[idx] !== 'zonk') {
        b[idx] = 'zonk';
        placed++;
      }
    }
    return b;
  };

  const handleStart = () => {
    if (user.balance < bet) return;
    setActualBoard(generateBoard());
    setBoard(Array(36).fill('hidden'));
    setGameState('playing');
    setSafeHits(0);
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing' || board[index] !== 'hidden') return;

    let isZonk = actualBoard[index] === 'zonk';

    // === SISTEM ALGORITMA LICIK OLYMPUS ===
    // Kalau spin awal (< 3), biarin aja menang gede.
    // Tapi kalo udah > 3 spin, baru nemu 2 tile langsung dipaksa meledak (ZONK)
    if (user.spinCount >= 2 && safeHits >= 2 && !isZonk) {
       isZonk = true; // Curang paksa zonk
    }

    const newBoard = [...board];
    if (isZonk) {
      for(let i=0; i<36; i++) {
        if(actualBoard[i] === 'zonk') newBoard[i] = 'zonk';
        else if (newBoard[i] === 'hidden') newBoard[i] = 'multiplier';
      }
      newBoard[index] = 'zonk'; 
      setBoard(newBoard);
      setGameState('crashed');
      onSpin(bet, { type: 'ZONK', multiplier: 0, winAmount: 0, message: 'DISAMBAR ZEUS! RUNGKAD MASBRO!' });
    } else {
      newBoard[index] = 'multiplier';
      setBoard(newBoard);
      setSafeHits(prev => prev + 1);
    }
  };

  const handleCashout = () => {
    if (gameState !== 'playing' || safeHits === 0) return;
    const newBoard = [...board];
    for(let i=0; i<36; i++) {
        if(actualBoard[i] === 'zonk') newBoard[i] = 'zonk';
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
      <div className="bg-[#1c082b] border-2 border-yellow-500 rounded-2xl w-full max-w-4xl flex flex-col md:flex-row shadow-[0_0_80px_rgba(234,179,8,0.3)] overflow-hidden h-[90vh] md:h-auto">
        
        {/* Sidebar Controls */}
        <div className="w-full md:w-80 bg-[#12051f] p-5 flex flex-col border-b md:border-b-0 md:border-r border-[#3d1a5c] shrink-0">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-white font-black text-xl italic uppercase tracking-wider text-yellow-400">OLYMPUS INTERACTIVE</h2>
                   <div className="text-[10px] text-purple-400 font-mono">PRAGMATIC | GACOR</div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
            </div>

            <div className="bg-[#1c082b] p-3 rounded-lg mb-6 flex justify-between items-center border border-yellow-900">
                <span className="text-gray-400 text-xs font-bold">SALDO</span>
                <span className="text-yellow-400 font-black font-mono">Rp {user.balance.toLocaleString('id-ID')}</span>
            </div>

            {gameState === 'idle' || gameState === 'cashedout' || gameState === 'crashed' ? (
                <div className="space-y-5 flex-1 overflow-y-auto">
                    <div>
                        <label className="text-xs text-purple-300 font-bold mb-2 block">AMOUNT (BET)</label>
                        <div className="flex items-center bg-[#0d0117] border border-[#3d1a5c] rounded-lg p-1">
                            <input 
                                type="number" 
                                value={bet} 
                                onChange={e => setBet(Number(e.target.value))}
                                className="bg-transparent w-full p-2 text-white font-mono outline-none"
                            />
                            <div className="flex gap-1 pr-1">
                                <button onClick={() => setBet(b => Math.max(banner.minBet, b/2))} className="bg-[#3d1a5c] text-xs px-2 py-1 rounded text-purple-200">/2</button>
                                <button onClick={() => setBet(b => Math.min(user.balance, b*2))} className="bg-[#3d1a5c] text-xs px-2 py-1 rounded text-purple-200">x2</button>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleStart} 
                        disabled={user.balance < bet}
                        className="w-full py-4 mt-4 rounded-xl font-black text-lg bg-gradient-to-b from-yellow-400 to-yellow-600 text-black shadow-[0_4px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none transition-all uppercase"
                    >
                        START HUNT
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-end">
                    <div className="bg-[#0d0117] p-4 rounded-xl border border-yellow-900 mb-4 text-center">
                        <div className="text-gray-400 text-xs font-bold mb-1">TOTAL PROFIT</div>
                        <div className="text-4xl font-black text-yellow-400 font-mono drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">{(currentMultiplier).toFixed(2)}x</div>
                        <div className="text-green-500 font-bold">+Rp {Math.floor(bet * currentMultiplier).toLocaleString('id-ID')}</div>
                    </div>

                    <div className="bg-[#0d0117] p-3 rounded-xl border border-[#3d1a5c] mb-4 flex justify-between items-center text-xs">
                        <span className="text-purple-300">Next Tile:</span>
                        <span className="text-yellow-500 font-bold">{(nextMultiplier).toFixed(2)}x</span>
                    </div>

                    <button 
                        onClick={handleCashout}
                        disabled={safeHits === 0}
                        className={`w-full py-5 rounded-xl font-black text-xl flex items-center justify-center gap-2 uppercase transition-all ${
                            safeHits === 0 
                            ? 'bg-[#1c082b] border border-[#3d1a5c] text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-b from-green-400 to-green-600 border-2 border-white text-black shadow-[0_4px_0_rgb(22,101,52)] active:translate-y-1 active:shadow-none animate-[pulse_1.5s_infinite]'
                        }`}
                    >
                        <HandCoins size={24}/> Cash Out
                    </button>
                </div>
            )}
        </div>

        {/* Right Play Area */}
        <div className="flex-1 bg-[#26103b] p-4 flex flex-col items-center justify-center relative overflow-y-auto min-h-[400px]">
            
            <div className="absolute top-4 right-4 text-[10px] text-yellow-500/50 font-mono flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-yellow-500/30">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                PROVABLY FAIR SYSTEM
            </div>

            <div className="grid grid-cols-6 gap-2 w-full max-w-[450px]">
                {board.map((tile, i) => {
                    const isGameOver = gameState === 'crashed' || gameState === 'cashedout';
                    return (
                        <button 
                            key={i}
                            disabled={gameState !== 'playing' || tile !== 'hidden'}
                            onClick={() => handleTileClick(i)}
                            className={`aspect-square rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center border-b-4
                                ${tile === 'hidden' && gameState === 'playing' ? 'bg-[#3d1a5c] border-[#290d42] hover:bg-[#522978] cursor-pointer hover:-translate-y-1' : ''}
                                ${tile === 'hidden' && isGameOver ? 'bg-[#1c082b] border-[#10031a] opacity-50 cursor-not-allowed' : ''}
                                ${tile === 'multiplier' ? 'bg-gradient-to-b from-yellow-700 to-yellow-900 border-[#664200] !border-b-0 translate-y-1' : ''}
                                ${tile === 'zonk' ? 'bg-[#400000] border-[#260000] !border-b-0 translate-y-1' : ''}
                            `}
                        >
                            <div className="scale-0 transition-transform duration-300" style={{ transform: tile !== 'hidden' ? 'scale(1)' : 'scale(0)'}}>
                                {tile === 'multiplier' && <Gem className="text-yellow-400 w-6 h-6 md:w-8 md:h-8 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />}
                                {tile === 'zonk' && <Zap className="text-red-500 w-8 h-8 md:w-10 md:h-10 animate-[bounce_0.5s_infinite]" />}
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Overlays */}
            {gameState === 'crashed' && (
                <div className="absolute inset-0 bg-red-900/40 pointer-events-none flex items-center justify-center animate-in fade-in backdrop-blur-[2px]">
                    <div className="bg-gradient-to-r from-red-600 to-red-800 border-4 border-black text-white font-black text-3xl md:text-5xl px-8 py-4 rounded-lg shadow-[0_0_50px_rgba(220,38,38,1)] text-center uppercase tracking-widest" style={{WebkitTextStroke: '2px black'}}>KEPETIR ZEUS!</div>
                </div>
            )}
            {gameState === 'cashedout' && (
                <div className="absolute inset-0 bg-yellow-900/30 pointer-events-none flex items-center justify-center animate-in fade-in backdrop-blur-[2px]">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 border-4 border-black text-black font-black text-3xl px-8 py-3 rounded-lg shadow-[0_0_50px_rgba(234,179,8,0.8)] uppercase">MENANG ${(currentMultiplier).toFixed(2)}x</div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
