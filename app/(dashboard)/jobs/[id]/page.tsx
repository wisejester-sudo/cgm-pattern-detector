"use client";

import { use, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Phone, MapPin, Clock, Wrench, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { JobStatus } from "@/components/job-card";

const statusConfig: Record<
  JobStatus,
  { label: string; className: string }
> = {
  scheduled: {
    label: "Scheduled",
    className: "bg-status-scheduled text-foreground",
  },
  enroute: {
    label: "En Route",
    className: "bg-status-enroute text-primary-foreground",
  },
  working: {
    label: "Working",
    className: "bg-status-working text-foreground",
  },
  complete: {
    label: "Complete",
    className: "bg-status-complete text-primary-foreground",
  },
};

// Mock data - in a real app, this would come from an API
const mockJob = {
  id: "1",
  customerName: "Sarah Johnson",
  phone: "(555) 123-4567",
  address: "123 Oak Street, Springfield, IL 62701",
  status: "scheduled" as JobStatus,
  jobType: "Repair",
  notes: "AC unit not cooling. Customer reports unusual noise when running.",
  scheduledDate: "March 10, 2026",
  scheduledTime: "9:00 AM - 11:00 AM",
  assignedTech: "Mike Thompson",
};

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [status, setStatus] = useState<JobStatus>(mockJob.status);
  const [smsSent, setSmsSent] = useState(false);

  const handleSendSMS = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back button and header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/jobs"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {mockJob.customerName}
            </h1>
            <p className="text-muted-foreground">Job #{id}</p>
          </div>
          <Badge className={`${statusConfig[status].className} text-sm px-3 py-1`}>
            {statusConfig[status].label}
          </Badge>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{mockJob.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{mockJob.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Job Type</p>
                <p className="font-medium">{mockJob.jobType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="font-medium">
                  {mockJob.scheduledDate}, {mockJob.scheduledTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{mockJob.notes}</p>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Update Status
                </label>
                <Select value={status} onValueChange={(v) => setStatus(v as JobStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(statusConfig) as JobStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusConfig[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleSendSMS} variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {smsSent ? "SMS Sent!" : "Send Status SMS"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
