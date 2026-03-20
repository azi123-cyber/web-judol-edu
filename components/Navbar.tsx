import React, { useState, useEffect } from 'react';
import { Home, Flame, Box, Dices, Wallet, LogOut, User } from 'lucide-react';
import { UserState } from '../types';

interface NavbarProps {
  user: UserState;
  onLoginClick: () => void;
  onNavigate: (page: string) => void;
  onDepositClick: () => void;
  onLogoutClick: () => void;
  activePage: string;
}

// Komponen News Bar yang Rapi (Tidak Jalan/Marquee, tapi ganti text)
const FlashNews = () => {
    const messages = [
        "⚡ SLOT GACOR HARI INI RTP 99% ⚡",
        "💎 BONUS NEW MEMBER 100% DI DEPAN 💎",
        "🔥 EVENT PETIR MERAH X500 SEDANG AKTIF 🔥",
        "💸 DEPO QRIS 1 DETIK MASUK - WD KILAT 💸"
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-red-700 text-white text-[10px] md:text-xs py-1.5 border-b border-yellow-500 text-center font-bold tracking-widest shadow-lg relative overflow-hidden">
            <div key={index} className="animate-in fade-in slide-in-from-top-2 duration-500">
                {messages[index]}
            </div>
        </div>
    );
};

export const Navbar: React.FC<NavbarProps> = ({ user, onLoginClick, onNavigate, onDepositClick, onLogoutClick, activePage }) => {
  return (
    <div className="sticky top-0 z-30 w-full shadow-2xl bg-gray-900">
      
      <FlashNews />

      {/* Main Header */}
      <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 py-2 px-3 md:px-4 flex justify-between items-center border-b-2 border-yellow-600 shadow-[0_5px_30px_rgba(234,179,8,0.2)]">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
            <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 rounded-lg transform rotate-6 border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,1)] animate-pulse z-10 relative">
                    <span className="text-black font-black text-xl md:text-2xl drop-shadow-md">R</span>
                </div>
            </div>
            
            <div className="flex flex-col -space-y-1">
                <h1 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-t from-yellow-500 via-white to-yellow-200 italic tracking-tighter filter drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
                    RAJA GACHA
                </h1>
                <div className="flex items-center gap-1">
                   <span className="bg-red-600 text-white text-[8px] font-bold px-1 rounded animate-pulse">LIVE</span>
                </div>
            </div>
        </div>

        {/* User Balance / Auth */}
        <div className="flex items-center gap-2">
            {user.isLoggedIn ? (
              <div className="flex items-center gap-2">
                
                {user.role === 'admin' ? (
                   <button onClick={() => onNavigate('admin')} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-black border-2 border-white hover:bg-red-500 animate-pulse shadow-[0_0_10px_red]">
                      PANEL
                   </button>
                ) : (
                    <div className="flex flex-col items-end mr-1">
                        <div className="flex items-center gap-1">
                             <User size={10} className="text-gray-400"/>
                             <span className="text-[10px] text-yellow-200 font-bold uppercase truncate max-w-[60px] md:max-w-none">{user.username}</span>
                        </div>
                        <div className="bg-black/80 px-2 py-0.5 rounded border border-yellow-500 shadow-[inset_0_0_10px_rgba(234,179,8,0.3)] cursor-pointer" onClick={onDepositClick}>
                            <span className="text-yellow-400 font-mono font-black text-xs md:text-sm">
                                💎 {user.gems.toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}
                
                <button 
                  onClick={onDepositClick}
                  className="bg-gradient-to-b from-green-500 to-green-800 text-white p-1.5 md:p-2 rounded-lg border-2 border-green-300 shadow-[0_0_15px_lime] sheen active:scale-95"
                >
                   <Wallet size={20} strokeWidth={3} />
                </button>

                <button 
                  onClick={onLogoutClick}
                  className="bg-gray-800 text-red-500 p-1.5 md:p-2 rounded-lg border border-red-900 hover:bg-red-900/50 active:scale-95"
                >
                   <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                 <button 
                  onClick={onLoginClick}
                  className="bg-gradient-to-b from-blue-500 to-blue-700 text-white px-4 py-1 rounded-full font-black text-[10px] md:text-xs border border-blue-300 shadow-[0_0_10px_blue]"
                >
                    MASUK
                </button>
                <button 
                  onClick={onLoginClick}
                  className="bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 text-white px-4 py-1 rounded-full font-black text-[10px] md:text-xs border border-yellow-300 shadow-[0_0_10px_orange] animate-blink"
                >
                    DAFTAR
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-black border-b-2 border-gray-800 pb-1">
        <div className="flex justify-between items-center px-1">
            <NavItem onClick={() => onNavigate('home')} icon={<Home size={20} />} label="HOME" active={activePage === 'home'} />
            <NavItem onClick={() => onNavigate('hot')} icon={<Flame size={20} className={activePage === 'hot' ? "text-orange-500 animate-bounce" : "text-gray-400"} />} label="HOT GAMES" active={activePage === 'hot'} />
            <NavItem onClick={() => onNavigate('inventory')} icon={<Box size={20} />} label="TAS SAYA" active={activePage === 'inventory'} />
            <NavItem onClick={() => onNavigate('home')} icon={<Dices size={20} />} label="ALL GAMES" active={activePage === 'games'} />
        </div>
      </div>
    </div>
  );
};

const NavItem: React.FC<{icon: React.ReactNode, label: string, active?: boolean, onClick: () => void}> = ({ icon, label, active, onClick }) => (
    <div 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-2 cursor-pointer transition-all ${active ? 'bg-gradient-to-t from-gray-800 to-transparent border-b-4 border-yellow-500' : 'hover:bg-gray-900'}`}
    >
        <div className={`mb-0.5 ${active ? 'text-yellow-400 scale-110' : 'text-gray-400'} transition-transform duration-200 drop-shadow-lg`}>
            {icon}
        </div>
        <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-tighter ${active ? 'text-white' : 'text-gray-500'}`}>
            {label}
        </span>
    </div>
)