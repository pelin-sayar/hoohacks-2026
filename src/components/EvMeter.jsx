import React from "react";

const EvMeter = ({ value }) => {
  /**
   * THE MATH:
   * scale is -2 to +2 (a total range of 4 units).
   * 0 is the center.
   * To turn this into a percentage (0% to 100%):
   * ((CurrentValue - MinValue) / TotalRange) * 100
   */
  
  const numericValue = Number(value) || 0;
  const clampedValue = Math.max(-2, Math.min(2, numericValue));
  const positionPercent = ((clampedValue + 2) / 4) * 100;

  return (
    <div className="flex items-center gap-4 pointer-events-auto select-none">
      
      {/* ev label */}
      <div className="flex items-center gap-1">
        <span className="text-white text-[11px] font-black tracking-tighter uppercase">EV</span>
        <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-cyan-400 border-b-[3px] border-b-transparent" />
      </div>

      {/* meter feature */}
      <div className="relative w-[240px] h-[40px] bg-black/60 border border-white/20 backdrop-blur-sm shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
        
        {/* numbers on meter */}
        <div className="absolute top-1 inset-x-0 flex justify-between px-3">
          {["-2", "-1", "0", "+1", "+2"].map((num) => (
            <span key={num} className="text-white/80 text-[10px] font-bold w-4 text-center tracking-tighter">
              {num}
            </span>
          ))}
        </div>

        {/* ticks on meter */}
        <div className="absolute bottom-2 inset-x-0 flex justify-between px-3 items-end h-2">
          {[...Array(13)].map((_, i) => {
            const isMajor = i % 3 === 0; // Highlights -2, -1, 0, 1, 2
            return (
              <div 
                key={i} 
                className={`bg-white/40 ${isMajor ? "h-2 w-[1.5px] bg-white/80" : "h-1 w-[1px]"}`} 
              />
            );
          })}
        </div>

        {/* sliding box */}
        <div
          className="absolute top-1/2 h-[22px] w-[16px] border border-white bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-500 ease-out flex items-center justify-center z-10"
          style={{ 
            left: `${positionPercent}%`,
            transform: `translate(-50%, -15%)` 
          }}
        >
          {/* inner focus dot in box */}
          <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]" />
        </div>

        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default EvMeter;