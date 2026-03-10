"use client";

import { useState } from "react";
import { JobCard, type Job, type JobStatus } from "@/components/job-card";
import { CreateJobModal } from "@/components/create-job-modal";

const initialJobs: Job[] = [
  {
    id: "1",
    customerName: "Sarah Johnson",
    phone: "(555) 123-4567",
    address: "123 Oak Street, Springfield, IL 62701",
    status: "scheduled",
    jobType: "Repair",
  },
  {
    id: "2",
    customerName: "Michael Chen",
    phone: "(555) 234-5678",
    address: "456 Maple Avenue, Springfield, IL 62702",
    status: "enroute",
    jobType: "Maintenance",
  },
  {
    id: "3",
    customerName: "Emily Rodriguez",
    phone: "(555) 345-6789",
    address: "789 Pine Road, Springfield, IL 62703",
    status: "working",
    jobType: "Installation",
  },
  {
    id: "4",
    customerName: "David Thompson",
    phone: "(555) 456-7890",
    address: "321 Cedar Lane, Springfield, IL 62704",
    status: "complete",
    jobType: "Repair",
  },
  {
    id: "5",
    customerName: "Lisa Anderson",
    phone: "(555) 567-8901",
    address: "654 Birch Court, Springfield, IL 62705",
    status: "scheduled",
    jobType: "Maintenance",
  },
  {
    id: "6",
    customerName: "James Wilson",
    phone: "(555) 678-9012",
    address: "987 Elm Drive, Springfield, IL 62706",
    status: "enroute",
    jobType: "Installation",
  },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
  };

  const handleCreateJob = (jobData: {
    customerName: string;
    phone: string;
    address: string;
    jobType: string;
  }) => {
    const newJob: Job = {
      id: Date.now().toString(),
      ...jobData,
      status: "scheduled",
    };
    setJobs((prev) => [newJob, ...prev]);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Jobs</h1>
          <p className="text-muted-foreground">
            Manage and track all your service jobs
          </p>
        </div>
        <CreateJobModal onCreateJob={handleCreateJob} />
      </div>

      {/* Job Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
