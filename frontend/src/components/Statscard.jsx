import React from 'react';

export default function StatsCard({ icon: Icon, label, value, color, iconColor }) {
  return (
    <div className={`clay-element bg-gradient-to-br ${color} p-4`}>
      <div className="text-center space-y-3">
        <div className="clay-gentle bg-white/60 inline-flex p-3">
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs font-medium text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}