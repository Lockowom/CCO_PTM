import React from 'react';
import { 
  BarChart as RechartsBar, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white p-3 rounded-lg shadow-xl border border-slate-700">
        <p className="text-xs font-bold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-mono" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BarChart = ({ 
  data, 
  dataKey, 
  xKey = 'name', 
  color = '#6366f1', 
  height = 300, 
  multipleKeys = [],
  layout = 'horizontal' 
}) => {
  const isVertical = layout === 'vertical';

  return (
    <div style={{ width: '100%', height: height }}>
      <ResponsiveContainer>
        <RechartsBar 
          data={data} 
          layout={layout}
          margin={{ top: 10, right: 30, left: isVertical ? 20 : -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={!isVertical} vertical={isVertical} stroke="#e2e8f0" />
          
          {isVertical ? (
            <>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis 
                dataKey={xKey} 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                width={80}
              />
            </>
          ) : (
            <>
              <XAxis 
                dataKey={xKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
              />
            </>
          )}

          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          {multipleKeys.length > 0 && <Legend />}
          
          {multipleKeys.length > 0 ? (
            multipleKeys.map((keyConfig, idx) => (
              <Bar 
                key={keyConfig.key}
                dataKey={keyConfig.key} 
                name={keyConfig.label || keyConfig.key}
                fill={keyConfig.color || color} 
                radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]} 
                barSize={30}
              />
            ))
          ) : (
            <Bar 
              dataKey={dataKey} 
              fill={color} 
              radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]} 
              barSize={isVertical ? 20 : 40}
            />
          )}
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
