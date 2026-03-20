import React from 'react';

export const HeroSlider: React.FC = () => {
  return (
    <div className="relative w-full h-48 md:h-80 overflow-hidden bg-gray-800">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10" />
      
      {/* Fake Banner Image */}
      <img 
        src="https://picsum.photos/id/133/1200/400" 
        alt="Main Event" 
        className="w-full h-full object-cover opacity-80"
      />

      <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-6 md:px-20">
        <div className="bg-black/60 p-4 border-l-4 border-yellow-500 backdrop-blur-sm transform skew-x-[-10deg]">
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 uppercase italic transform skew-x-[10deg]">
            Grand Event
          </h1>
          <p className="text-white mt-2 font-bold tracking-wider transform skew-x-[10deg]">
            DROP RATE UP TO <span className="text-red-500 text-xl">500%</span>
          </p>
        </div>
        <button className="mt-6 bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-black py-2 px-8 rounded-full border-2 border-white hover:scale-105 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.6)]">
          CLAIM BONUS
        </button>
      </div>
    </div>
  );
};
