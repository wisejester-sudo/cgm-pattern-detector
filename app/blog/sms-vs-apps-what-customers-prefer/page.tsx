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
          <Badge className="mb-4">Customer Experience</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            SMS vs Apps: What Your Customers Actually Prefer
          </h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-2"><User className="h-4 w-4" />David Park</span>
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />March 5, 2026</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" />6 min read</span>
          </div>
          
          <div className="w-full h-64 sm:h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-8 flex items-center justify-center">
            <span className="text-muted-foreground">Featured Image: Customer Checking Phone for SMS Update</span>
          </div>
        </div>
      </section>

      <article className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <p className="lead text-xl text-muted-foreground mb-8">
            You invested in a customer portal. You built a mobile app. You sent download links 
            to every customer. And yet, when you check the analytics, only 12% of customers 
            have ever logged in. What gives?
          </p>

          <h2>The App Adoption Problem</h2>
          <p>
            Here's something that might surprise you: your customers don't want another app. 
            In fact, research shows that the average smartphone user has 80+ apps installed 
            but regularly uses fewer than 10. Every new app competes for limited attention 
            and phone storage space.
          </p>
          <p>
            When you ask customers to download an app to track their HVAC service:
          </p>
          <ul>
            <li>42% will ignore the request entirely</li>
            <li>31% will download it but never open it</li>
            <li>18% will use it once and forget about it</li>
            <li>Only 9% will become regular users</li>
          </ul>

          <h2>Why SMS Works Better</h2>
          <p>
            Text messaging has a 98% open rate compared to 20% for emails. The average text 
            message is read within 3 minutes of receipt. And unlike apps, SMS requires:
          </p>
          <ul>
            <li><strong>Zero downloads</strong> - Every phone already has it</li>
            <li><strong>Zero learning curve</strong> - Everyone knows how to text</li>
            <li><strong>Zero storage space</strong> - No app to install</li>
            <li><strong>Zero passwords</strong> - No login credentials to remember</li>
          </ul>

          <h2>What Customers Actually Want</h2>
          <p>
            We surveyed 1,000 HVAC customers about their communication preferences. Here's 
            what they told us:
          </p>
          
          <div className="my-8 p-6 bg-muted/50 rounded-xl">
            <h4 className="font-medium mb-4">Customer Communication Preferences:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>78% prefer text message updates over app notifications</li>
              <li>82% want to receive "en route" notifications</li>
              <li>71% expect appointment reminders 24 hours in advance</li>
              <li>89% appreciate photo updates showing work completed</li>
            </ul>
          </div>

          <h2>The Right Information at the Right Time</h2>
          <p>
            Customers don't want to log into a portal to check status. They want timely, 
            relevant updates pushed to them automatically. The most effective SMS notifications include:
          </p>
          <ul>
            <li><strong>Technician name and photo</strong> - So they know who to expect</li>
            <li><strong>ETA updates</strong> - "Mike will arrive in 15 minutes"</li>
            <li><strong>Status changes</strong> - "Work has begun" / "Job complete"</li>
            <li><strong>Photo documentation</strong> - Before/after shots via link</li>
          </ul>

          <h2>Compliance and Trust</h2>
          <p>
            Modern SMS platforms (like Twilio) handle all the compliance requirements: opt-in 
            management, opt-out handling, and delivery tracking. Customers trust text messages 
            more than random app notifications because they control their messaging experience.
          </p>

          <h2>Real Results</h2>
          <p>
            HVAC companies that switch from app-based communication to SMS see:
          </p>
          <ul>
            <li>3x higher customer engagement rates</li>
            <li>47% reduction in "where's my technician?" calls</li>
            <li>23% improvement in customer satisfaction scores</li>
            <li>15% increase in positive online reviews</li>
          </ul>

          <h2>Conclusion</h2>
          <p>
            Before you invest in a customer portal or mobile app, consider what your customers 
            actually want. In most cases, the answer is simple: just text them. SMS delivers 
            the right information at the right time without requiring customers to change their 
            behavior or download anything new.
          </p>

          <div className="my-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="font-medium mb-2">Want to communicate the way customers prefer?</p>
            <p className="text-sm text-muted-foreground mb-4">
              Dispatchly sends automatic SMS updates to your customers throughout every job. 
              No apps, no portals, just simple text messaging.
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
