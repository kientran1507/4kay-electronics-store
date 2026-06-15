import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import formatDate from "@/app/utils/formateDate";
import formatVND from "@/app/utils/formatCurrency";

interface SalesLineChartProps {
  data: Array<{ date: string; amount: number; }>;
}

const SalesLineChart = ({ data }: SalesLineChartProps) => {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Sales Last 7 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatDate(value)}
              />
              <YAxis 
                tickFormatter={(value) => new Intl.NumberFormat('vi-VN', {
                  notation: "compact",
                  compactDisplay: "short"
                }).format(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatVND(value)}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#8884d8" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesLineChart;
