
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="absolute inset-0 z-50 bg-[#000814] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-24 h-24 border-2 border-cyan-500 rounded-full animate-spin border-t-transparent shadow-[0_0_20px_rgba(34,211,238,0.4)]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-cyan-400 chinese-font text-3xl font-bold animate-pulse">
            剑
          </span>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <h2 className="text-cyan-100 text-xl tracking-[0.5em] chinese-font uppercase">
          天道酬勤 · 凡人修仙
        </h2>
        <p className="text-cyan-800 text-xs mt-4 tracking-[0.2em] animate-pulse">
          INITIALIZING SPIRITUAL ENERGY... REQUESTING CAMERA ACCESS...
        </p>
      </div>
      
      <div className="absolute bottom-10 text-cyan-900/40 text-[10px] text-center max-w-xs px-8 italic">
        "Hundreds of years of cultivation for one moment of brilliance. The Sword Sect awaits its master."
      </div>
    </div>
  );
};

export default LoadingScreen;
