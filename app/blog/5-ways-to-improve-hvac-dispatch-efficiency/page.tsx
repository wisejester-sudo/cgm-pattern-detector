import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"

export default function BlogPost() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      </div>

      {/* Navigation */}
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

      {/* Article Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Badge className="mb-4">Operations</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            5 Ways to Improve Your HVAC Dispatch Efficiency
          </h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mike Johnson
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              March 15, 2026
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              5 min read
            </span>
          </div>
          
          {/* Featured Image Placeholder */}
          <div className="w-full h-64 sm:h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-8 flex items-center justify-center">
            <span className="text-muted-foreground">Featured Image: HVAC Technician with Tablet</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <p className="lead text-xl text-muted-foreground mb-8">
            If you're running an HVAC business, you know that dispatch efficiency can make or break your 
            daily operations. Every minute your technicians spend waiting for assignments or driving 
            between jobs is money left on the table. Here are five proven strategies to streamline 
            your dispatch process.
          </p>

          <h2>1. Automate Your Scheduling</h2>
          <p>
            Manual scheduling is not only time-consuming but also prone to errors. When you're juggling 
            multiple technicians, customer preferences, and emergency calls, things slip through the cracks. 
            By implementing automated scheduling software, you can:
          </p>
          <ul>
            <li>Reduce scheduling conflicts by 85%</li>
            <li>Automatically match technicians based on skills and location</li>
            <li>Send instant notifications when jobs are assigned</li>
            <li>Handle emergency calls without disrupting the entire schedule</li>
          </ul>
          
          <div className="my-8 p-6 bg-muted/50 rounded-xl">
            <p className="text-sm font-medium mb-2">Pro Tip:</p>
            <p className="text-sm text-muted-foreground">
              Look for dispatch software that integrates with your existing calendar systems and 
              can automatically optimize routes based on traffic patterns.
            </p>
          </div>

          <h2>2. Implement Real-Time GPS Tracking</h2>
          <p>
            Knowing where your technicians are at all times isn't about micromanagement—it's about 
            making smart decisions. When a customer calls with an emergency, you need to know which 
            technician can get there fastest.
          </p>
          <p>
            Real-time tracking also helps you identify patterns. Are your technicians consistently 
            running late to certain areas? Maybe you need to adjust your service territories or 
            dispatch procedures for those neighborhoods.
          </p>

          <h2>3. Use Two-Way Communication Tools</h2>
          <p>
            Text messaging has become the preferred communication method for both technicians and 
            customers. It's fast, convenient, and doesn't require anyone to download special apps.
          </p>
          <p>
            Modern dispatch systems can automatically:
          </p>
          <ul>
            <li>Send customers arrival notifications when techs are en route</li>
            <li>Allow technicians to update job status via simple text replies</li>
            <li>Request customer feedback immediately after job completion</li>
            <li>Send appointment reminders to reduce no-shows</li>
          </ul>

          <h2>4. Create Standard Operating Procedures</h2>
          <p>
            Every successful HVAC company has clear procedures for common scenarios. When everyone 
            knows exactly what to do, you eliminate the chaos of decision-making on the fly.
          </p>
          <p>
            Document your procedures for:
          </p>
          <ul>
            <li>Emergency call handling</li>
            <li>After-hours dispatch protocols</li>
            <li>Customer communication standards</li>
            <li>Equipment and parts ordering workflows</li>
          </ul>

          <h2>5. Measure What Matters</h2>
          <p>
            You can't improve what you don't measure. Track these key metrics to identify 
            bottlenecks in your dispatch process:
          </p>
          <ul>
            <li><strong>Average response time</strong> - How quickly can you get a tech to a job?</li>
            <li><strong>First-time fix rate</strong> - Are techs arriving prepared?</li>
            <li><strong>Customer satisfaction scores</strong> - How do customers rate your service?</li>
            <li><strong>Technician utilization</strong> - Are you maximizing billable hours?</li>
          </ul>

          <h2>Getting Started</h2>
          <p>
            Improving dispatch efficiency doesn't happen overnight. Start with one or two of these 
            strategies and build from there. Many HVAC companies see significant improvements within 
            the first month of implementing new dispatch procedures.
          </p>
          <p>
            The key is consistency. Once you establish new workflows, make sure everyone on your 
            team understands and follows them. Regular training and feedback sessions will help 
            you refine your processes over time.
          </p>

          <div className="my-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="font-medium mb-2">Ready to modernize your dispatch?</p>
            <p className="text-sm text-muted-foreground mb-4">
              Dispatchly helps HVAC companies streamline their operations with simple SMS-based 
              communication. No apps to download, no training required.
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
