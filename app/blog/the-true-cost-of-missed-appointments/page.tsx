import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"

export default function BlogPost() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      </div>

      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold">Dispatchly</span>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Badge className="mb-4">Operations</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            The True Cost of Missed Appointments
          </h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-2"><User className="h-4 w-4" />Sarah Chen</span>
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />February 20, 2026</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" />5 min read</span>
          </div>
          
          <div className="w-full h-64 sm:h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-8 flex items-center justify-center">
            <span className="text-muted-foreground">Featured Image: Empty House with No-Show</span>
          </div>
        </div>
      </section>

      <article className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <p className="lead text-xl text-muted-foreground mb-8">
            A technician arrives at a customer's home. Knocks on the door. No answer. Calls the 
            customer. Voicemail. An hour of billable time, wasted. And that's just the beginning 
            of the costs.
          </p>

          <h2>The Obvious Costs</h2>
          <p>
            When a customer doesn't show up for their appointment, the immediate losses are clear:
          </p>
          <ul>
            <li><strong>Lost revenue</strong> - $150-400 per missed appointment</li>
            <li><strong>Wasted technician time</strong> - 1-2 hours including travel</li>
            <li><strong>Fuel costs</strong> - $15-30 for the wasted trip</li>
            <li><strong>Opportunity cost</strong> - Another customer could have had that slot</li>
          </ul>
          
          <div className="my-8 p-6 bg-muted/50 rounded-xl">
            <p className="text-sm font-medium mb-2">Quick Math:</p>
            <p className="text-sm text-muted-foreground">
              If you have 3 no-shows per week, that's 150+ missed appointments annually. 
              At $200 average per appointment, you're losing <strong>$30,000+ per year</strong> 
              in direct revenue.
            </p>
          </div>

          <h2>The Hidden Costs</h2>
          <p>
            But the real damage goes deeper than the immediate lost revenue:
          </p>

          <h3>Technician Morale</h3>
          <p>
            Nothing frustrates technicians more than wasted trips. They drive across town, 
            prepare for the job, and then sit in their truck unable to work. Repeated no-shows 
            lead to disengagement and higher turnover.
          </p>

          <h3>Scheduling Chaos</h3>
          <p>
            When appointments don't show, your carefully planned schedule falls apart. Dispatchers 
            scramble to find last-minute replacements. Other customers get moved around. The ripple 
            effect can disrupt your entire day.
          </p>

          <h3>Customer Relationships</h3>
          <p>
            The customers who did show up on time? They're now waiting because you're behind 
            schedule. The customers who get moved to accommodate no-shows? They're inconvenienced. 
            Everyone's unhappy.
          </p>

          <h2>Why Customers Don't Show</h2>
          <p>
            Understanding why appointments get missed helps you prevent them:
          </p>
          <ul>
            <li><strong>They forgot</strong> - Life gets busy; without reminders, appointments slip through</li>
            <li><strong>They wrote down the wrong time</strong> - Miscommunication during booking</li>
            <li><strong>Something came up</strong> - Emergencies happen, but they forget to call</li>
            <li><strong>They didn't realize the tech was coming</strong> - No confirmation or reminder</li>
          </ul>

          <h2>Prevention Strategies That Work</h2>

          <h3>1. Automated Reminders</h3>
          <p>
            The most effective prevention is simple: remind customers. Text message reminders 
            24 hours in advance reduce no-shows by 38%. Add a second reminder 2 hours before 
            the appointment for even better results.
          </p>

          <h3>2. Confirmation Requests</h3>
          <p>
            Don't just remind—ask for confirmation. A simple "Reply YES to confirm" text gives 
            customers a chance to reschedule if needed. It's better to know in advance than 
            waste a trip.
          </p>

          <h3>3. En Route Notifications</h3>
          <p>
            When technicians are on their way, customers should know. "Mike is 15 minutes away" 
            keeps the appointment top-of-mind and reduces last-minute cancellations.
          </p>

          <h3>4. Clear Communication</h3>
          <p>
            When booking, confirm: date, time window, customer address, and contact number. 
            Send a calendar invite they can save. The more touchpoints, the less likely they 
            are to forget.
          </p>

          <h2>When No-Shows Happen Anyway</h2>
          <p>
            Even with perfect systems, some customers won't show. Here's how to handle it:
          </p>
          <ul>
            <li><strong>Charge a fee</strong> - Many companies charge $50-100 for no-shows after one warning</li>
            <li><strong>Require deposits</strong> - For expensive jobs, collect a deposit upfront</li>
            <li><strong>Flag repeat offenders</strong> - Note customers with multiple no-shows</li>
            <li><strong>Have a waitlist</strong> - Keep a list of customers who want same-day service</li>
          </ul>

          <h2>The ROI of Prevention</h2>
          <p>
            Implementing a reminder system costs very little—often just a few cents per text 
            message. If it prevents even one no-show per month, it pays for itself many times over.
          </p>
          <p>
            The math is simple: invest $100/month in automated reminders, prevent 10 no-shows, 
            save $2,000+ in revenue. That's a 20x return on investment.
          </p>

          <div className="my-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="font-medium mb-2">Ready to eliminate no-shows?</p>
            <p className="text-sm text-muted-foreground mb-4">
              Dispatchly automatically sends appointment reminders, confirmations, and en route 
              notifications via text message. Customers respond better—and show up more often.
            </p>
            <Link href="/signup">
              <Button>Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
