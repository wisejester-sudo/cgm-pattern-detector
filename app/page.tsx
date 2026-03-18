import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Users, 
  Camera, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Smartphone,
  Workflow,
  Bell,
  Star
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
        <div className="absolute right-0 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-primary/10 opacity-20 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Dispatchly
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/tech" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Technician Portal
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="shadow-lg shadow-primary/25">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-8 px-4 py-1.5 text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
              Now with AI-Powered Dispatch
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                Field Service Management
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Dispatchly helps HVAC and field service companies manage jobs, dispatch technicians, 
              and communicate with customers—all through simple SMS. No apps to download.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-6 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Hero Image / Dashboard Preview */}
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl opacity-70" />
              <div className="relative rounded-2xl bg-card border shadow-2xl overflow-hidden">
                <div className="border-b bg-muted/50 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                    <div className="h-3 w-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="ml-4 text-muted-foreground text-sm font-mono">dispatchly.co/dashboard</div>
                </div>
                <div className="p-6 bg-gradient-to-br from-card to-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background/80 backdrop-blur rounded-xl p-4 border shadow-sm">
                      <div className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wider">Active Jobs</div>
                      <div className="text-3xl font-bold text-foreground">12</div>
                      <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 rotate-[-45deg]" /> +3 today
                      </div>
                    </div>
                    <div className="bg-background/80 backdrop-blur rounded-xl p-4 border shadow-sm">
                      <div className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wider">Technicians</div>
                      <div className="text-3xl font-bold text-foreground">5</div>
                      <div className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 rotate-[-45deg]" /> 2 on route
                      </div>
                    </div>
                    <div className="bg-background/80 backdrop-blur rounded-xl p-4 border shadow-sm">
                      <div className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wider">Completed Today</div>
                      <div className="text-3xl font-bold text-green-500">8</div>
                      <div className="text-xs text-muted-foreground mt-1">94% satisfaction</div>
                    </div>
                  </div>
                  <div className="mt-4 bg-background/80 backdrop-blur rounded-xl p-4 border shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">Recent Jobs</span>
                      <Badge variant="outline" className="text-xs">Live</Badge>
                    </div>
                    <div className="space-y-2">
                      {[
                        { status: "En Route", color: "bg-blue-500", time: "10:30 AM" },
                        { status: "Working", color: "bg-yellow-500", time: "11:15 AM" },
                        { status: "Complete", color: "bg-green-500", time: "9:45 AM" },
                      ].map((job, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${job.color}`} />
                            <span className="text-sm font-medium">AC Repair - {job.status}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{job.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
            Trusted by HVAC companies across the country
          </p>
          <div className="flex justify-center items-center gap-12 opacity-50 grayscale">
            {['Cool Air HVAC', 'Summit Heating', 'FrostGuard', 'ClimatePro', 'Apex Air'].map((company) => (
              <span key={company} className="text-lg font-semibold">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for field service businesses.
              No fluff, just what works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[180px]">
            {/* Job Management */}
            <div className="row-span-2 rounded-3xl bg-card border p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Workflow className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Job Management</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create, assign, and track jobs from start to finish. See status updates in real-time.
              </p>
              <div className="space-y-2">
                {['Scheduled', 'En Route', 'Working', 'Complete'].map((status, i) => (
                  <div key={status} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SMS Communication */}
            <div className="rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 border p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">SMS Communication</h3>
              <p className="text-muted-foreground text-sm">
                Two-way texting with customers and techs. No apps needed.
              </p>
            </div>

            {/* Photo Management */}
            <div className="rounded-3xl bg-card border p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Photo Management</h3>
              <p className="text-muted-foreground text-sm">
                Techs upload photos from the field. Customers view via web link.
              </p>
            </div>

            {/* Team Management */}
            <div className="rounded-3xl bg-card border p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Management</h3>
              <p className="text-muted-foreground text-sm">
                Invite technicians with magic links. No passwords needed.
              </p>
            </div>

            {/* Real-time Updates */}
            <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-foreground/5 to-foreground/10 border p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bell className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Instant notifications when jobs are updated. Customers receive SMS alerts 
                    when techs are en route, working, and complete.
                  </p>
                </div>
                <div className="hidden md:flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-4xl font-bold mb-4">Simple as SMS</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No apps to download. No training needed. Just simple text messaging.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create a Job",
                description: "Enter customer details and assign a technician. Takes less than 60 seconds."
              },
              {
                step: "02",
                title: "Tech Gets SMS",
                description: "Technician receives a text with job details and a magic link to update status."
              },
              {
                step: "03",
                title: "Customer Stays Informed",
                description: "Automatic SMS updates keep customers informed every step of the way."
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent" />
                )}
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
            <h2 className="text-4xl font-bold mb-4">Loved by HVAC Pros</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Dispatchly cut our scheduling time by 80%. No more phone tag with technicians.",
                author: "Mike Johnson",
                role: "Owner, Cool Air HVAC",
                rating: 5
              },
              {
                quote: "Our customers love the text updates. They know exactly when we're arriving.",
                author: "Sarah Chen",
                role: "Dispatch Manager, Summit Heating",
                rating: 5
              },
              {
                quote: "We tried 3 other systems. Dispatchly was the only one our techs actually used.",
                author: "David Park",
                role: "Operations, FrostGuard",
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="rounded-2xl bg-card border p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start free for 14 days. No credit card required.
          </p>
          
          <div className="inline-flex items-center gap-8 p-8 rounded-3xl bg-card border shadow-xl">
            <div className="text-left">
              <div className="text-sm text-muted-foreground mb-1">Starter Plan</div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">$39</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Up to 3 technicians</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Unlimited jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">SMS messaging</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-2">
                View Full Pricing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:20px_20px]" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-primary-foreground mb-4">
                Ready to simplify your dispatch?
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join hundreds of HVAC companies saving hours every week with Dispatchly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-primary-foreground/60">
                14-day free trial • No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold">Dispatchly</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Field service management made simple.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Dispatchly. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/tech" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Technician Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
