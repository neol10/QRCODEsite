
import React from 'react';

export const AnalyticsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-8 w-40 bg-white/5 rounded-xl"></div>
      <div className="h-10 w-32 bg-white/5 rounded-xl"></div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-32 bg-[#1A2F2C] rounded-3xl border border-white/5"></div>
      <div className="h-32 bg-[#1A2F2C] rounded-3xl border border-white/5"></div>
    </div>
    <div className="h-64 bg-[#1A2F2C] rounded-3xl border border-white/5"></div>
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-[#1A2F2C] rounded-2xl border border-white/5"></div>
      ))}
    </div>
  </div>
);

export const LeadsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 w-48 bg-white/5 rounded-xl mb-4"></div>
    <div className="h-14 w-full bg-[#1A2F2C] rounded-2xl border border-white/10"></div>
    <div className="grid grid-cols-2 gap-3">
      <div className="h-24 bg-[#1A2F2C] rounded-3xl border border-white/5"></div>
      <div className="h-24 bg-[#1A2F2C] rounded-3xl border border-white/5"></div>
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-[#1A2F2C] rounded-3xl border border-white/5"></div>
      ))}
    </div>
  </div>
);
