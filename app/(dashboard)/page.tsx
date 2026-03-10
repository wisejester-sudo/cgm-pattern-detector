import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Clock, Truck, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Jobs",
    value: "24",
    description: "This week",
    icon: Briefcase,
    color: "text-foreground",
    bgColor: "bg-muted",
  },
  {
    title: "Scheduled",
    value: "8",
    description: "Pending dispatch",
    icon: Clock,
    color: "text-status-scheduled",
    bgColor: "bg-status-scheduled/10",
  },
  {
    title: "In Progress",
    value: "5",
    description: "En route or working",
    icon: Truck,
    color: "text-status-enroute",
    bgColor: "bg-status-enroute/10",
  },
  {
    title: "Completed",
    value: "11",
    description: "This week",
    icon: CheckCircle,
    color: "text-status-complete",
    bgColor: "bg-status-complete/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your service operations
          </p>
        </div>
        <Link href="/jobs">
          <Button>View All Jobs</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/jobs">
            <Button variant="outline">
              <Briefcase className="mr-2 h-4 w-4" />
              Manage Jobs
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Configure SMS Templates
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
