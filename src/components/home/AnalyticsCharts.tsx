'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartPoint {
  date: string;
  burials: number;
  views: number;
}

interface AnalyticsChartsProps {
  data: ChartPoint[];
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  // If data is empty, provide default timeline points with 0
  const chartData = data && data.length > 0 ? data : [
    { date: 'Day 1', burials: 0, views: 0 },
    { date: 'Day 2', burials: 0, views: 0 },
    { date: 'Day 3', burials: 0, views: 0 },
    { date: 'Day 4', burials: 0, views: 0 },
    { date: 'Today', burials: 0, views: 0 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Chart 1: Burials Over Time */}
      <div className="bento-card p-5 bg-[#0A0A0A] border-[#222222]">
        <div className="flex items-center justify-between mb-4">
          <span className="font-heading text-base sm:text-lg text-white uppercase">
            BURIALS ACTIVITY
          </span>
          <span className="bento-pill bg-[#121212] border-[#262626] text-[#A3A3A3] text-[10px]">
            CUMULATIVE
          </span>
        </div>

        <div className="w-full h-44 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="burialGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1237E8" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#737373" />
              <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#737373" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A0A0A',
                  borderRadius: '16px',
                  border: '1.5px solid #262626',
                  color: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  boxShadow: '4px 4px 0 #000000',
                }}
              />
              <Area
                type="monotone"
                dataKey="burials"
                stroke="#1237E8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#burialGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Views Over Time */}
      <div className="bento-card p-5 bg-[#0A0A0A] border-[#222222]">
        <div className="flex items-center justify-between mb-4">
          <span className="font-heading text-base sm:text-lg text-white uppercase">
            GRAVE VISITS & VIEWS
          </span>
          <span className="bento-pill bg-[#1237E8] text-white border-[#222222] text-[10px]">
            TOTAL VISITS
          </span>
        </div>

        <div className="w-full h-44 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#5CE1FF" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#737373" />
              <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#737373" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A0A0A',
                  borderRadius: '16px',
                  border: '1.5px solid #262626',
                  color: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  boxShadow: '4px 4px 0 #000000',
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#0A1FC4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#viewsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}