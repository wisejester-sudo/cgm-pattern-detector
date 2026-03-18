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
          <Badge className="mb-4">Growth</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Scaling Your HVAC Business: From 5 to 20 Technicians
          </h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-2"><User className="h-4 w-4" />Mike Johnson</span>
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />February 28, 2026</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" />8 min read</span>
          </div>
          
          <div className="w-full h-64 sm:h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-8 flex items-center justify-center">
            <span className="text-muted-foreground">Featured Image: Growing HVAC Team</span>
          </div>
        </div>
      </section>

      <article className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <p className="lead text-xl text-muted-foreground mb-8">
            Growing from a 5-person crew to a 20-technician operation is exciting—and terrifying. 
            The systems that worked when you were small start breaking down. Here's how to scale 
            without losing what made you successful in the first place.
          </p>

          <h2>The Breaking Point: Why Growth Hurts</h2>
          <p>
            Most HVAC companies hit a wall around 8-12 technicians. Suddenly, the owner who used 
            to know every job, every customer, and every technician can't keep track anymore. 
            Phones ring off the hook. Dispatch becomes chaotic. Quality starts slipping.
          </p>
          <p>
            This isn't a sign that growth is bad—it's a sign that you need new systems. Here are 
            the key areas to address when scaling your team.
          </p>

          <h2>1. Build Your Leadership Layer</h2>
          <p>
            You can't manage 20 technicians directly. You need leads or supervisors who can 
            handle day-to-day oversight. Look for technicians who:
          </p>
          <ul>
            <li>Have strong technical skills and can mentor others</li>
            <li>Communicate well with both techs and customers</li>
            <li>Take ownership of problems without being asked</li>
            <li>Buy into your company's values and culture</li>
          </ul>
          
          <div className="my-8 p-6 bg-muted/50 rounded-xl">
            <p className="text-sm font-medium mb-2">Leadership Structure Example:</p>
            <ul className="text-sm text-muted-foreground mb-0">
              <li>Owner/GM - Strategy, key relationships, business development</li>
              <li>Operations Manager - Scheduling, dispatch, customer service</li>
              <li>Service Manager - Technical quality, training, troubleshooting</li>
              <li>Lead Technicians (2-3) - Field supervision, crew management</li>
            </ul>
          </div>

          <h2>2. Standardize Everything</h2>
          <p>
            When you were small, everyone just "knew" how things worked. At 20 technicians, 
            you need documented standards for:
          </p>
          <ul>
            <li><strong>Customer interactions</strong> - How to greet customers, explain work, handle complaints</li>
            <li><strong>Technical procedures</strong> - Installation standards, diagnostic protocols</li>
            <li><strong>Sales process</strong> - How to present options, handle pricing conversations</li>
            <li><strong>Quality checks</strong> - What to inspect before leaving a job</li>
          </ul>

          <h2>3. Invest in Training</h2>
          <p>
            Growing fast means hiring less experienced techs. That's fine—as long as you have 
            a training program. Consider:
          </p>
          <ul>
            <li>Weekly technical training sessions</li>
            <li>Mentorship programs pairing new techs with veterans</li>
            <li>Manufacturer training certifications</li>
            <li>Soft skills training (customer service, sales)</li>
          </ul>

          <h2>4. Upgrade Your Technology</h2>
          <p>
            The spreadsheet that worked for 5 techs won't work for 20. You need systems that scale:
          </p>
          <ul>
            <li><strong>Dispatch software</strong> - Route optimization, real-time tracking</li>
            <li><strong>Communication tools</strong> - SMS updates, team messaging</li>
            <li><strong>Documentation</strong> - Photo uploads, digital work orders</li>
            <li><strong>Inventory management</strong> - Track parts across multiple trucks</li>
          </ul>

          <h2>5. Maintain Your Culture</h2>
          <p>
            It's easy to lose the family feel when you grow fast. Fight this by:
          </p>
          <ul>
            <li>Regular all-hands meetings where everyone gets heard</li>
            <li>Celebrating wins (completions, positive reviews, anniversaries)</li>
            <li>Maintaining open-door policies with leadership</li>
            <li>Investing in team building and company events</li>
          </ul>

          <h2>6. Watch Your Numbers</h2>
          <p>
            At 20 technicians, small efficiency losses compound quickly. Track:
          </p>
          <ul>
            <li><strong>Revenue per technician</strong> - Is productivity increasing?</li>
            <li><strong>Callback rates</strong> - Is quality suffering?</li>
            <li><strong>Customer satisfaction</strong> - Are you maintaining service levels?</li>
            <li><strong>Employee retention</strong> - Are you keeping good people?</li>
          </ul>

          <h2>Common Pitfalls to Avoid</h2>
          <p>
            We've seen companies make the same mistakes when scaling:
          </p>
          <ul>
            <li><strong>Hiring too fast</strong> - One bad tech can damage your reputation</li>
            <li><strong>Promoting based on seniority</strong> - Best techs aren't always best leaders</li>
            <li><strong>Ignoring customer feedback</strong> - Growth should improve service, not hurt it</li>
            <li><strong>Underinvesting in systems</strong> - Cheap software costs more in the long run</li>
          </ul>

          <h2>The Bottom Line</h2>
          <p>
            Scaling from 5 to 20 technicians is achievable for any committed HVAC business owner. 
            The key is being intentional about your systems, your people, and your culture. Growth 
            for growth's sake isn't the goal—building a sustainable, profitable business that 
            serves customers better than the competition is.
          </p>

          <div className="my-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="font-medium mb-2">Ready to scale your dispatch operations?</p>
            <p className="text-sm text-muted-foreground mb-4">
              Dispatchly grows with you—from 1 technician to 50. Simple pricing, no per-user fees.
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
