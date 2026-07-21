"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Paleta de cores premium
const STATUS_COLORS: Record<string, string> = {
  Abertos: "#10b981", // Emerald 500
  Finalizados: "#3b82f6", // Blue 500
  "Não Finalizados": "#ef4444", // Red 500
};

const COMPANY_COLORS = ["#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#10b981"];

const STEP_COLORS = [
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f59e0b",
];

interface OverviewChartProps {
  data: { name: string; total: number }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
        />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            borderRadius: "8px",
            color: "#fff",
            border: "none",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
          }}
          itemStyle={{ color: "#f8fafc" }}
        />
        <Area
          type="monotone"
          dataKey="total"
          name="Atendimentos"
          stroke="#ef4444"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorTotal)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface StatusPieChartProps {
  data: { name: string; value: number }[];
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={STATUS_COLORS[entry.name] || COMPANY_COLORS[index % COMPANY_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            borderRadius: "8px",
            color: "#fff",
            border: "none",
          }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface ProblemsByCompanyChartProps {
  data: { company: string; count: number }[];
}

export function ProblemsByCompanyChart({ data }: ProblemsByCompanyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-400 text-sm">
        Nenhum registro de problema por empresa até o momento.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" stroke="#64748b" fontSize={12} allowDecimals={false} />
        <YAxis
          dataKey="company"
          type="category"
          stroke="#475569"
          fontSize={13}
          tickLine={false}
          width={110}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            borderRadius: "8px",
            color: "#fff",
            border: "none",
          }}
          formatter={(value: any) => [`${value} reclamações`, "Problemas"]}
        />
        <Bar dataKey="count" name="Reclamações" radius={[0, 6, 6, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COMPANY_COLORS[index % COMPANY_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface StepDropoffChartProps {
  data: { step: string; stepLabel: string; count: number }[];
}

export function StepDropoffChart({ data }: StepDropoffChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-400 text-sm">
        Nenhum dado de fluxo ou abandono registrado.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="stepLabel"
          stroke="#64748b"
          fontSize={11}
          tickLine={false}
          interval={0}
          angle={-15}
          textAnchor="end"
        />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            borderRadius: "8px",
            color: "#fff",
            border: "none",
          }}
          formatter={(value: any) => [`${value} usuários`, "Retidos / Pararam nesta etapa"]}
        />
        <Bar dataKey="count" name="Usuários nesta Etapa" radius={[6, 6, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={STEP_COLORS[index % STEP_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
