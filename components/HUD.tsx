
import React from 'react';
import { HandData, GestureType } from '../types';

interface Props {
  hands: HandData[];
  isCameraActive: boolean;
}

const HUD: React.FC<Props> = ({ hands, isCameraActive }) => {
  const getGestureName = (type: GestureType) => {
    switch (type) {
      case GestureType.FIST: return { cn: '握', en: 'FIST / CONVERGE' };
      case GestureType.OPEN_PALM: return { cn: '舒', en: 'PALM / DEFENSE' };
      case GestureType.POINTING: return { cn: '指', en: 'POINT / ATTACK' };
      default: return { cn: '平', en: 'IDLE / ORBIT' };
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20">
      <div className="flex justify-between items-start">
        <div className="bg-cyan-950/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500'} animate-pulse`} />
            <span className="text-cyan-400 text-[10px] tracking-widest font-bold uppercase">Spiritual Nexus: {isCameraActive ? 'STABLE' : 'SEARCHING'}</span>
          </div>
          <div className="mt-1 text-[10px] text-cyan-600 tracking-tighter">
            LATENCY: 12ms | SECTOR: NORTH-EAST_QI
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-cyan-100/30 text-[10px] tracking-widest uppercase mb-1">Immortal Stage</div>
          <div className="text-cyan-400 text-xl font-black chinese-font">元婴后期 · NASCENT SOUL</div>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        {hands.length === 0 ? (
          <div className="text-cyan-900/40 text-xs italic animate-pulse px-4 py-2 border border-cyan-950/20 rounded">Waiting for Manual Sign...</div>
        ) : (
          hands.map((hand, i) => (
            <div key={i} className="bg-cyan-950/60 backdrop-blur-xl border-l-4 border-cyan-400 p-4 min-w-[200px] shadow-2xl">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-cyan-700 text-[10px] font-bold tracking-tighter">HAND_ALPHA_{i+1}</span>
                <span className="text-white font-black text-2xl chinese-font">{getGestureName(hand.gesture).cn}</span>
              </div>
              <div className="text-cyan-400 text-xs font-bold tracking-widest uppercase">
                {getGestureName(hand.gesture).en}
              </div>
              <div className="mt-3 flex space-x-1">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className={`h-1 flex-1 transition-colors duration-200 ${hand.gesture !== GestureType.IDLE ? 'bg-cyan-400 shadow-[0_0_5px_cyan]' : 'bg-cyan-900'}`} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-center mb-6">
        <div className="flex space-x-8 px-8 py-3 bg-black/60 backdrop-blur-md rounded-full border border-cyan-900/30">
          <InstructionItem label="OPEN PALM" action="CIRCLE DEFENSE" />
          <InstructionItem label="FIST" action="CONVERGE BEAM" />
          <InstructionItem label="POINT INDEX" action="DIRECT STRIKE" />
        </div>
      </div>
    </div>
  );
};

const InstructionItem = ({ label, action }: { label: string, action: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-cyan-800 text-[8px] tracking-[0.2em] uppercase font-bold">{label}</span>
    <span className="text-cyan-200 text-[10px] font-bold tracking-widest uppercase mt-1">{action}</span>
  </div>
);

export default HUD;
