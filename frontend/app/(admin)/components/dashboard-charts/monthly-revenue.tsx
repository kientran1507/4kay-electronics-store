import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import formatVND from "@/app/utils/formatCurrency";

interface MonthlyRevenueProps {
  data: Array<{ month: string; value: number; }>;
}

const MonthlyRevenue = ({ data = [] }: MonthlyRevenueProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => 
                new Intl.NumberFormat('vi-VN', {
                  notation: "compact",
                  compactDisplay: "short"
                }).format(value)
              } />
              <Tooltip formatter={(value) => formatVND(Number(value))} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyRevenue;
