"use client"

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Weekly activity data
const weeklyData = [
  { day: "Mon", routines: 12, lessons: 4, communications: 8 },
  { day: "Tue", routines: 15, lessons: 6, communications: 12 },
  { day: "Wed", routines: 11, lessons: 5, communications: 9 },
  { day: "Thu", routines: 18, lessons: 7, communications: 15 },
  { day: "Fri", routines: 14, lessons: 4, communications: 11 },
  { day: "Sat", routines: 8, lessons: 2, communications: 6 },
  { day: "Sun", routines: 6, lessons: 1, communications: 4 },
]

// Progress over time
const progressData = [
  { week: "W1", progress: 45 },
  { week: "W2", progress: 52 },
  { week: "W3", progress: 58 },
  { week: "W4", progress: 65 },
  { week: "W5", progress: 72 },
  { week: "W6", progress: 78 },
]

// Routine completion by category
const routineCategories = [
  { name: "Morning", value: 35, color: "#000000" },
  { name: "Afternoon", value: 28, color: "#404040" },
  { name: "Evening", value: 22, color: "#808080" },
  { name: "Night", value: 15, color: "#c0c0c0" },
]

// Caree engagement scores
const engagementData = [
  { name: "Alex", score: 85 },
  { name: "Maya", score: 92 },
  { name: "Eli", score: 78 },
  { name: "Noah", score: 88 },
]

// Custom tooltip styles
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-black/10 px-4 py-3 shadow-lg">
        <p className="text-xs font-medium text-black mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs text-black/60">
            {entry.name}: <span className="text-black font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function WeeklyActivityChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRoutines" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000000" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#000000" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#666666" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#666666" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#666' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#666' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="routines"
            stroke="#000000"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRoutines)"
            name="Routines"
          />
          <Area
            type="monotone"
            dataKey="lessons"
            stroke="#666666"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorLessons)"
            name="Lessons"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProgressChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
          <XAxis 
            dataKey="week" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 11, fill: '#666' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 11, fill: '#666' }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="progress"
            stroke="#000000"
            strokeWidth={2}
            dot={{ fill: '#000000', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: '#000000' }}
            name="Progress %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RoutineCategoriesChart() {
  return (
    <div className="h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={routineCategories}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {routineCategories.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function EngagementChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
          <XAxis 
            type="number" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 11, fill: '#666' }}
            domain={[0, 100]}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 11, fill: '#666' }}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" fill="#000000" radius={[0, 4, 4, 0]} name="Score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MiniSparkline({ data, color = "#000" }: { data: number[], color?: string }) {
  const chartData = data.map((value, index) => ({ value, index }))
  
  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Legend component for pie chart
export function RoutineCategoriesLegend() {
  return (
    <div className="flex flex-wrap gap-4 mt-4 justify-center">
      {routineCategories.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-black/60">{item.name}</span>
          <span className="text-xs font-medium text-black">{item.value}%</span>
        </div>
      ))}
    </div>
  )
}
