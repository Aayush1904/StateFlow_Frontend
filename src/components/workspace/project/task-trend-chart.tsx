import { ResponsiveContainer, LineChart, CartesianGrid, Line, Tooltip, XAxis, YAxis } from "recharts";

type TaskTrendChartProps = {
  data: {
    date: string;
    created: number;
    completed: number;
  }[];
};

const formatDateLabel = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const TaskTrendChart = ({ data }: TaskTrendChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateLabel}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          labelFormatter={(value) =>
            new Date(value as string).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          }
        />
        <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TaskTrendChart;

