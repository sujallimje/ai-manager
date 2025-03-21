import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const RetentionHeatmap = ({ inputData }) => {
  // Sample data as fallback
  const fallbackHeatmapData = [
    {"cohort":"Jan","month0":100,"month1":88.8,"month2":79.5,"month3":74.2,"month4":68.2,"month5":65.4,"month6":59.4,"totalUsers":2854},
    {"cohort":"Feb","month0":100,"month1":89.2,"month2":80.6,"month3":72.1,"month4":65.3,"month5":62.3,"month6":55.7,"totalUsers":2960},
    {"cohort":"Mar","month0":100,"month1":87.5,"month2":78.2,"month3":70.6,"month4":67.1,"month5":63.8,"month6":58.9,"totalUsers":3102},
    {"cohort":"Apr","month0":100,"month1":90.3,"month2":81.7,"month3":75.2,"month4":69.4,"month5":64.2,"month6":60.1,"totalUsers":2891}
  ];
  
  // Use provided data or fallback
  const data = inputData && inputData.length > 0 ? inputData : fallbackHeatmapData;

  // Function to get color based on retention value
  const getColor = (value) => {
    // Scale from light blue to dark blue based on retention percentage
    const intensity = Math.floor((value / 100) * 255);
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
  };

  // Get all month keys (month0, month1, etc.)
  const monthKeys = Object.keys(data[0])
    .filter(key => key.startsWith('month'))
    .sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)));

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>User Retention Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border text-left">Cohort</th>
                <th className="p-2 border text-left">Users</th>
                {monthKeys.map((month) => (
                  <th key={month} className="p-2 border text-center">
                    Month {month.slice(5)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.cohort}>
                  <td className="p-2 border font-medium">{row.cohort}</td>
                  <td className="p-2 border text-right">{row.totalUsers.toLocaleString()}</td>
                  {monthKeys.map((month) => (
                    <td
                      key={month}
                      className="p-2 border text-center"
                      style={{
                        backgroundColor: getColor(row[month]),
                        color: row[month] > 50 ? 'white' : 'black'
                      }}
                    >
                      {row[month].toFixed(1)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetentionHeatmap;