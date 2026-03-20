import React from 'react';
import { MessageCircle, Gift } from 'lucide-react';

export const FloatingUI: React.FC = () => {
  return (
    <>
      {/* Sticky Bottom Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-yellow-600/30 flex justify-around items-center p-2 z-40 md:hidden">
        <button className="flex flex-col items-center text-yellow-500">
          <Gift size={20} />
          <span className="text-[10px] mt-1 font-bold">PROMO</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-white">
           {/* Placeholder for center CTA */}
          <div className="w-12 h-12 -mt-6 rounded-full bg-yellow-500 flex items-center justify-center border-4 border-gray-900 shadow-lg animate-bounce">
            <span className="font-bold text-black text-xs">SPIN</span>
          </div>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <MessageCircle size={20} />
          <span className="text-[10px] mt-1">CHAT</span>
        </button>
      </div>

      {/* Desktop "Live Chat" Girl Overlay */}
      <div className="fixed bottom-4 right-4 z-40 hidden md:flex flex-col items-end gap-2 group cursor-pointer">
        <div className="bg-white text-black text-xs font-bold px-3 py-1 rounded-l-full rounded-t-full shadow-lg mb-1 animate-bounce origin-bottom-right">
          Butuh Bantuan?
        </div>
        <div className="relative">
          {/* This represents the 'Live Chat' girl image often found on these sites */}
          <img 
            src="https://picsum.photos/id/64/100/100" 
            className="w-20 h-20 rounded-full border-4 border-yellow-500 shadow-xl object-cover"
            alt="Support"
          />
          <div className="absolute -bottom-2 -left-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black italic px-6 py-1 transform -skew-x-12 border border-white shadow-lg">
            LIVE CHAT
          </div>
        </div>
      </div>
    </>
  );
};
