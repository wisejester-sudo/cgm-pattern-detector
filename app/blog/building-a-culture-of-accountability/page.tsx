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
          <Badge className="mb-4">Leadership</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Building a Culture of Accountability in Field Service
          </h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-2"><User className="h-4 w-4" />David Park</span>
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />February 15, 2026</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" />7 min read</span>
          </div>
          
          <div className="w-full h-64 sm:h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-8 flex items-center justify-center">
            <span className="text-muted-foreground">Featured Image: Team Meeting in Field Service</span>
          </div>
        </div>
      </section>

      <article className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <p className="lead text-xl text-muted-foreground mb-8">
            You can't be everywhere at once. You can't ride along with every technician or 
            listen to every customer call. So how do you ensure quality without micromanaging 
            every move? The answer is accountability—not as a punishment, but as a culture.
          </p>

          <h2>What Accountability Isn't</h2>
          <p>
            Before we talk about building accountability, let's clear up what it doesn't mean:
          </p>
          <ul>
            <li><strong>It's not micromanagement</strong> - Hovering over every job kills morale</li>
            <li><strong>It's not blame</strong> - When things go wrong, focus on systems, not shame</li>
            <li><strong>It's not surveillance</strong> - GPS tracking alone doesn't create ownership</li>
            <li><strong>It's not rigid rules</strong> - Flexibility and accountability can coexist</li>
          </ul>

          <h2>What Accountability Is</h2>
          <p>
            True accountability in field service means:
          </p>
          <ul>
            <li><strong>Clear expectations</strong> - Everyone knows what success looks like</li>
            <li><strong>Ownership</strong> - Technicians take responsibility for outcomes</li>
            <li><strong>Transparency</strong> - Performance is visible, not hidden</li>
            <li><strong>Support</strong> - People get help when they struggle, not just criticism</li>
          </ul>

          <h2>Building the Foundation</h2>

          <h3>1. Define Clear Standards</h3>
          <p>
            Technicians can't meet expectations they don't understand. Document your standards for:
          </p>
          <ul>
            <li>Arrival times and communication with customers</li>
            <li>Quality of work and testing procedures</li>
            <li>Cleanliness and professionalism on site</li>
            <li>Documentation and photo requirements</li>
            <li>Sales performance (if applicable)</li>
          </ul>

          <h3>2. Make Performance Visible</h3>
          <p>
            When technicians can see their own performance—and compare it fairly to peers—they 
            naturally self-correct. Key metrics to track:
          </p>
          <ul>
            <li>On-time arrival percentage</li>
            <li>First-time fix rate</li>
            <li>Customer satisfaction scores</li>
            <li>Average job completion time</li>
            <li>Callbacks and warranty issues</li>
          </ul>

          <div className="my-8 p-6 bg-muted/50 rounded-xl">
            <p className="text-sm font-medium mb-2">Pro Tip: Make it a competition</p>
            <p className="text-sm text-muted-foreground">
              Many HVAC companies run monthly contests based on customer reviews or first-time 
              fix rates. Small prizes ($50-100) and public recognition drive engagement without 
              creating unhealthy competition.
            </p>
          </div>

          <h3>3. Regular One-on-Ones</h3>
          <p>
            Weekly 15-minute check-ins with each technician catch problems early and reinforce 
            priorities. Ask:
          </p>
          <ul>
            <li>What's going well this week?</li>
            <li>What challenges are you facing?</li>
            <li>How can I help you succeed?</li>
            <li>What feedback do you have for the company?</li>
          </ul>

          <h2>The Technology Component</h2>
          <p>
            Modern tools make accountability easier—not by spying on employees, but by providing 
            the data everyone needs to improve:
          </p>

          <h3>Automated Job Tracking</h3>
          <p>
            When technicians update job status (en route, arrived, working, complete) via simple 
            text messages, you get real-time visibility without anyone feeling watched. The data 
            belongs to everyone.
          </p>

          <h3>Customer Feedback Loops</h3>
          <p>
            Automatic satisfaction surveys sent after each job give technicians immediate feedback. 
            Positive reviews get celebrated. Negative feedback triggers coaching, not punishment.
          </p>

          <h3>Photo Documentation</h3>
          <p>
            Requiring before/after photos on every job creates natural accountability. Technicians 
            take pride in their work when they know it will be seen.
          </p>

          <h2>Handling Underperformance</h2>
          <p>
            Even with great systems, some technicians will struggle. Here's how to address it:
          </p>

          <h3>The Conversation Framework</h3>
          <ol>
            <li><strong>Start with data</strong> - "I noticed your callback rate is 15% vs team average of 8%"</li>
            <li><strong>Ask for perspective</strong> - "What do you think is contributing to that?"</li>
            <li><strong>Listen</strong> - Maybe they're missing tools, training, or facing personal issues</li>
            <li><strong>Collaborate on solutions</strong> - "Let's try X for the next two weeks and see if it helps"</li>
            <li><strong>Follow up</strong> - Check progress regularly and adjust as needed</li>
          </ol>

          <h2>When Accountability Breaks Down</h2>
          <p>
            Watch for these warning signs:
          </p>
          <ul>
            <li>Technicians stop reporting issues (fear of blame)</li>
            <li>Everyone meets minimums but nobody exceeds them (mediocrity culture)</li>
            <li>High performers leave while low performers stay (reward imbalance)</li>
            <li>Customers complain about the same issues repeatedly (system failure)</li>
          </ul>

          <h2>The Payoff</h2>
          <p>
            Companies with strong accountability cultures see:
          </p>
          <ul>
            <li>40% lower technician turnover</li>
            <li>25% higher customer satisfaction</li>
            <li>30% fewer callbacks and warranty issues</li>
            <li>Significantly higher profitability</li>
          </ul>

          <div className="my-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="font-medium mb-2">Want to build accountability without micromanaging?</p>
            <p className="text-sm text-muted-foreground mb-4">
              Dispatchly gives technicians visibility into their own performance while keeping 
              managers informed. Everyone stays aligned—automatically.
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
