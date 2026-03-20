"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  Camera,
  User,
  Briefcase,
  Bell,
  MapPin,
  Smartphone,
  Zap,
  ChevronRight,
  Star,
  Shield,
  Users
} from "lucide-react"
import { Logo } from "@/components/logo"
import { MockScreenshot } from "@/components/mock-screenshot"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="/how-it-works" className="text-sm font-medium text-foreground">How It Works</Link>
              <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
              <Link href="/signup">
                <Button size="sm" className="shadow-lg shadow-primary/20">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            Complete Walkthrough
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            How Dispatchly{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              transforms your business
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            See exactly how HVAC owners and technicians use Dispatchly every day.
            From job creation to completion, every step explained with screenshots.
          </p>

        </div>
      </section>

      {/* Workflow Tabs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="owner" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="grid w-full max-w-md grid-cols-2 h-14">
                <TabsTrigger value="owner" className="text-base">
                  <Briefcase className="w-4 h-4 mr-2" />
                  For Business Owners
                </TabsTrigger>
                <TabsTrigger value="technician" className="text-base">
                  <User className="w-4 h-4 mr-2" />
                  For Technicians
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="owner" className="mt-0">
              <div className="space-y-24">
                {/* Step 1 */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                      Job Creation
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Create a new job in under 60 seconds</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      From your dashboard, click "New Job" and fill in the customer details.
                      Dispatchly automatically saves the customer to your database for future jobs.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Customer name, address, and phone number",
                        "Job description and service type",
                        "Priority level and preferred time",
                        "Assign to technician instantly"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Average time: 45 seconds</span>
                    </div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <MockScreenshot type="create-job" />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <MockScreenshot type="dispatch" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                      Smart Dispatch
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Assign jobs with a single click</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      See all your technicians' availability in real-time. Drag and drop jobs to assign them,
                      or let Dispatchly suggest the best technician based on location and workload.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Real-time technician location tracking",
                        "Workload balancing across your team",
                        "ETA calculations for customer updates",
                        "Automatic conflict detection"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                      <Bell className="h-4 w-4" />
                      <span>Techs receive instant SMS notification</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                      Customer Communication
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Keep customers informed automatically</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Customers receive SMS updates at every stage: when the technician is assigned,
                      en route, has arrived, and when the job is complete. No more "where's my tech?" calls.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Automatic status update texts",
                        "Technician photo and bio shared",
                        "Live arrival time estimates",
                        "Two-way SMS for customer questions"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>98% customer satisfaction rate</span>
                    </div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <MockScreenshot type="customer-sms" />
                  </div>
                </div>

                {/* Step 4 */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <MockScreenshot type="live-tracking" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
                      Live Tracking
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Watch jobs progress in real-time</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Your dashboard shows the live status of every job. See which technicians are
                      en route, working, or complete. Photos and notes appear instantly as techs upload them.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Real-time status updates from field",
                        "Photo documentation from technicians",
                        "Job notes and customer signatures",
                        "Time tracking for each job stage"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                      <Camera className="h-4 w-4" />
                      <span>Photos stored securely for 90 days</span>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">5</span>
                      Job Completion
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Review and close jobs from anywhere</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      When technicians mark jobs complete, you get notified instantly. Review photos,
                      notes, and customer feedback before closing the job. Everything is archived for your records.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Review all job photos and documentation",
                        "Customer satisfaction survey sent automatically",
                        "Job history permanently archived",
                        "Generate reports for any time period"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>All data backed up and secure</span>
                    </div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <MockScreenshot type="job-complete" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Technician Workflow */}
            <TabsContent value="technician" className="mt-0">
              <div className="space-y-24">
                {/* Step 1 */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-4">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                      Receive Assignment
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Get job details via text message</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      When you're assigned a job, you get an SMS with the customer name, address,
                      phone number, and job description. No app to install, no login to remember.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "SMS notification with magic link",
                        "One-tap access to job details",
                        "Customer contact info included",
                        "Map directions with one click"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                      <Smartphone className="h-4 w-4" />
                      <span>Works on any phone with SMS</span>
                    </div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <MockScreenshot type="tech-sms" />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <MockScreenshot type="tech-view" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-4">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                      Mobile Job View
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Access everything from your phone</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Tap the magic link to open your job details. See customer info, job history,
                      and special instructions. Update your status with a single tap.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Mobile-optimized job details page",
                        "Customer history and notes",
                        "Equipment photos from previous visits",
                        "Status update buttons (En Route, Working, Complete)"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      <span>No app download required</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-4">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                      Update Status
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Keep everyone informed with one tap</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Heading to the job? Tap "En Route." Customer gets notified instantly with your
                      ETA. Started working? Tap "Working." Done? Tap "Complete." It's that simple.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "One-tap status updates",
                        "Customer notified automatically",
                        "Add notes for the office",
                        "Track time spent on each job"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                      <Bell className="h-4 w-4" />
                      <span>Office sees updates instantly</span>
                    </div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <MockScreenshot type="tech-status" />
                  </div>
                </div>

                {/* Step 4 */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <MockScreenshot type="tech-photos" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-4">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">4</span>
                      Document Everything
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Upload photos from the field</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Take photos of the job site, equipment, repairs, or anything else. Photos are
                      automatically compressed and uploaded. Customer and office can see them instantly.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Take photos directly or upload from gallery",
                        "Automatic compression for fast upload",
                        "Add captions to explain each photo",
                        "Photos organized by job automatically"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                      <Camera className="h-4 w-4" />
                      <span>Works even with poor signal</span>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-4">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">5</span>
                      Complete & Move On
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Mark complete and get your next job</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      When you're done, tap "Complete." Add final notes and any recommended follow-up.
                      The customer gets notified, and you're ready for your next assignment.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Final notes and recommendations",
                        "Customer signature capture (if needed)",
                        "Automatic job time logging",
                        "Next job assignment notification"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Job history saved automatically</span>
                    </div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <MockScreenshot type="tech-complete" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Comparison</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Dispatchly vs The Old Way
            </h2>
            <p className="text-lg text-muted-foreground">
              See how we stack up against phone calls, spreadsheets, and complex software
            </p>
          </div>

          <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-muted/50 border-b">
              <div className="p-4 font-semibold">Task</div>
              <div className="p-4 font-semibold text-muted-foreground">The Old Way</div>
              <div className="p-4 font-semibold text-primary">With Dispatchly</div>
            </div>
            {[
              {
                task: "Create a job",
                old: "5-10 min phone call + paper form",
                dispatchly: "45 seconds on your phone"
              },
              {
                task: "Notify technician",
                old: "Phone call, maybe they answer",
                dispatchly: "Instant SMS with all details"
              },
              {
                task: "Update customer",
                old: "Customer calls asking 'where are they?'",
                dispatchly: "Automatic SMS at every step"
              },
              {
                task: "Get job photos",
                old: "Wait for tech to return to office",
                dispatchly: "Instant upload from field"
              },
              {
                task: "Track status",
                old: "Call techs for updates",
                dispatchly: "Real-time dashboard view"
              },
              {
                task: "Setup time",
                old: "Days or weeks of training",
                dispatchly: "10 minutes, zero training"
              }
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                <div className="p-4 font-medium border-r">{row.task}</div>
                <div className="p-4 text-muted-foreground border-r text-sm">{row.old}</div>
                <div className="p-4 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {row.dispatchly}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Common Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about using Dispatchly
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Do my technicians need to download an app?",
                answer: "No. Technicians receive SMS messages with magic links. When they tap the link, they get a mobile-optimized web page with all job details. No app store, no installation, no login credentials to remember."
              },
              {
                question: "What if my technician has an older phone?",
                answer: "Dispatchly works on any phone that can receive text messages and browse the web. Even basic smartphones from 10 years ago work perfectly."
              },
              {
                question: "Can customers reply to the SMS messages?",
                answer: "Yes. When customers reply to status updates, their message comes directly to your dashboard. You can respond from Dispatchly and they'll get your reply as a text."
              },
              {
                question: "What happens when a job is done?",
                answer: "When a technician marks a job complete, you get notified instantly. The customer receives a completion message with a satisfaction survey. All photos and notes are saved to the job history."
              },
              {
                question: "How long are photos stored?",
                answer: "Photos are stored for 90 days by default. You can download important photos to keep them longer, or upgrade for extended storage."
              },
              {
                question: "Can I try this before paying?",
                answer: "Absolutely. Every account starts with a 14-day free trial. No credit card required. Use all features, add your technicians, send real SMS messages. If you don't love it, you pay nothing."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2 flex items-start gap-3">
                  <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-muted-foreground ml-8">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by HVAC professionals
            </h2>
            <p className="text-lg text-muted-foreground">
              See what dispatch managers and technicians are saying
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg mb-6">
                "I was skeptical about switching from ServiceTitan, but Dispatchly has saved me 2 hours every day.
                My techs actually use it without complaining, and customers love the text updates."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">MJ</span>
                </div>
                <div>
                  <div className="font-semibold">Marcus Johnson</div>
                  <div className="text-sm text-muted-foreground">Owner, Johnson HVAC Solutions</div>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg mb-6">
                "As a technician, I hated downloading another app and remembering another password.
                Dispatchly just sends me texts. Tap the link, see my job, update my status. Done."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-600">SR</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah Rodriguez</div>
                  <div className="text-sm text-muted-foreground">Senior HVAC Technician</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to streamline your dispatch?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join hundreds of HVAC companies saving hours every week.
                Start your free 14-day trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-base px-8">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}