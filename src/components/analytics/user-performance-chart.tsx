"use client";

import { useProjectStore } from "@/stores/project-store";
import { useAuthStore } from "@/stores/auth-store"; // You might need a user list store later
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function UserPerformanceChart() {
  const { tasks } = useProjectStore(); // Assuming tasks are available here or need to fetch globally

  // Calculate tasks per user (mocked logic if assignee is not consistent yet)
  // Since we don't have a dedicated "All Users" store easily accessible with Names, 
  // we will aggregate from tasks' "assignedTo" field if available, or mock for now as "Unassigned"
  
  // Real implementation needs: 
  // 1. Fetch all users
  // 2. Count completed tasks per user
  
  // For prototype, let's group by 'status' as a proxy for "Workload Distribution"
  // or use the task.assignedTo if defined.
  
  const data = [
    { name: 'Completed', value: tasks.filter(t => t.status === 'done').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length },
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Status Distribution</CardTitle>
        <CardDescription>
          Overall distribution of tasks by status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
