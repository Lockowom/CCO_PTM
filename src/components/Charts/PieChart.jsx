import React from 'react';
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-slate-900 p-3 rounded-lg shadow-xl border border-slate-300">
        <p className="text-sm font-bold mb-1">{payload[0].name}</p>
        <p className="text-xs font-mono">
          Valor: <span className="font-bold text-indigo-300">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const PieChart = ({ data, dataKey = 'value', nameKey = 'name', height = 300, innerRadius = 60, outerRadius = 80 }) => {
  return (
    <div style={{ width: '100%', height: height }}>
      <ResponsiveContainer>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Wrapper para evitar conflicto de nombres con el componente PieChart de Recharts
const RechartsPieChart = RechartsPie;

export default PieChart;
