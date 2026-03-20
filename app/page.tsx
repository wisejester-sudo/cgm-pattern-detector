import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Users, 
  Camera, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  BarChart3,
  Smartphone,
  Workflow,
  Bell,
  Star,
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
  HardHat,
  Truck,
  LayoutDashboard,
  Briefcase
} from "lucide-react"
import { Logo } from "@/components/logo"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Effects - Subtle gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-50/50 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b bg-white/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/tech" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Technicians</Link>
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
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <HardHat className="h-4 w-4" />
                Built for Field Service Teams
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Field service management{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  without the headache
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Dispatchly helps field service companies manage jobs, dispatch technicians, and keep customers informed—all through simple SMS. No apps to download, no training required.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="shadow-xl shadow-primary/20 text-base px-8">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="text-base px-8">
                    See How It Works
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Hero Dashboard Mockup */}
            <div className="relative lg:pl-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl blur-2xl opacity-50" />
              <div className="relative rounded-2xl overflow-hidden bg-white shadow-2xl border">
                {/* Mock Dashboard Header */}
                <div className="bg-sidebar border-b px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-semibold">Dispatchly</span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">JD</div>
                  </div>
                </div>
                {/* Mock Dashboard Content */}
                <div className="p-4 space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-muted-foreground">Active Jobs</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-xs text-muted-foreground">Technicians</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-2xl font-bold">94%</p>
                      <p className="text-xs text-muted-foreground">Completion</p>
                    </div>
                  </div>
                  {/* Job List Mock */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Today&apos;s Jobs</p>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">Customer {i}</p>
                          <p className="text-xs text-muted-foreground">AC Repair • 2:00 PM</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">En Route</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Service Companies" },
              { value: "50K+", label: "Jobs Completed" },
              { value: "98%", label: "Customer Satisfaction" },
              { value: "80%", label: "Time Saved" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to run your business
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed specifically for field service companies. No fluff, just what works.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1: Dashboard */}
            <div className="bg-card border rounded-2xl overflow-hidden">
              <div className="p-6 border-b bg-muted/30">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Command Dashboard</h3>
                <p className="text-muted-foreground">See everything at a glance. Track jobs, technicians, and performance in real-time.</p>
              </div>
              <div className="p-6 bg-slate-50/50">
                {/* Mock Dashboard Mini */}
                <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Jobs</span>
                    <span className="text-lg font-bold text-primary">12</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-primary rounded-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-700">5</div>
                      <div className="text-green-600">Working</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="font-bold text-blue-700">4</div>
                      <div className="text-blue-600">En Route</div>
                    </div>
                    <div className="p-2 bg-amber-50 rounded">
                      <div className="font-bold text-amber-700">3</div>
                      <div className="text-amber-600">Scheduled</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Job Management */}
            <div className="bg-card border rounded-2xl overflow-hidden">
              <div className="p-6 border-b bg-muted/30">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Job Management</h3>
                <p className="text-muted-foreground">Create, assign, and track jobs from start to finish. Never lose track of a job again.</p>
              </div>
              <div className="p-6 bg-slate-50/50">
                {/* Mock Job Card */}
                <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Sarah Johnson</p>
                      <p className="text-sm text-muted-foreground">AC Repair & Maintenance</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Working</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Today, 2:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">MT</div>
                    <span className="text-sm">Mike T.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: SMS Notifications */}
            <div className="bg-card border rounded-2xl overflow-hidden">
              <div className="p-6 border-b bg-muted/30">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">SMS Notifications</h3>
                <p className="text-muted-foreground">Keep customers informed with automatic text updates. No apps to download.</p>
              </div>
              <div className="p-6 bg-slate-50/50">
                {/* Mock SMS Thread */}
                <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-2 text-sm max-w-[80%]">
                      Your technician Mike is on the way! Estimated arrival: 2:15 PM
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-4 py-2 text-sm max-w-[80%]">
                      Great, thanks!
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-2 text-sm max-w-[80%]">
                      Job completed! View photos: [link]
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Mobile Technician View */}
            <div className="bg-card border rounded-2xl overflow-hidden">
              <div className="p-6 border-b bg-muted/30">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mobile-First for Techs</h3>
                <p className="text-muted-foreground">Technicians get a simple mobile interface. No apps to install—works on any phone.</p>
              </div>
              <div className="p-6 bg-slate-50/50">
                {/* Mock Mobile View */}
                <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3 max-w-[240px] mx-auto">
                  <div className="flex items-center gap-2 pb-3 border-b">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">MT</div>
                    <span className="font-medium text-sm">Hi, Mike</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Your Jobs Today</p>
                  <div className="space-y-2">
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="font-medium text-sm">Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">AC Repair • 2:00 PM</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 mt-2 inline-block">En Route</span>
                    </div>
                    <div className="p-3 border rounded-lg opacity-60">
                      <p className="font-medium text-sm">Tom Wilson</p>
                      <p className="text-xs text-muted-foreground">Maintenance • 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple as sending a text
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in minutes. No training, no apps, no hassle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create a Job",
                description: "Enter customer details and assign a technician. Takes less than 60 seconds.",
                icon: LayoutDashboard,
              },
              {
                step: "02",
                title: "Tech Gets Notified",
                description: "Technician receives an SMS with job details and a magic link to update status.",
                icon: MessageSquare,
              },
              {
                step: "03",
                title: "Everyone Stays Informed",
                description: "Customers get automatic updates when techs are en route, working, and complete.",
                icon: CheckCircle2,
              },
            ].map((item, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-8 shadow-sm">
                <div className="text-5xl font-bold text-primary/10 leading-none mb-4">{item.step}</div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by service professionals
            </h2>
            <p className="text-lg text-muted-foreground">
              See what field service companies are saying about Dispatchly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Dispatchly cut our scheduling time by 80%. No more phone tag with technicians trying to figure out where they are.",
                author: "Mike Johnson",
                role: "Owner, Johnson Services",
                rating: 5,
              },
              {
                quote: "Our customers love the text updates. They know exactly when we're arriving and what to expect.",
                author: "Sarah Chen",
                role: "Operations Manager",
                rating: 5,
              },
              {
                quote: "We tried 3 other systems. Dispatchly was the only one our technicians actually used without complaining.",
                author: "David Park",
                role: "Service Director",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-card border rounded-2xl p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">{testimonial.author[0]}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              One plan, everything included. Start free for 14 days.
            </p>
          </div>

          <div className="bg-card border rounded-3xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Starter Plan</h3>
                    <p className="text-muted-foreground">Everything you need</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">$39</span>
                    <span className="text-xl text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Billed monthly. Cancel anytime.
                  </p>
                </div>

                <Link href="/signup">
                  <Button size="lg" className="w-full shadow-lg shadow-primary/20">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  14-day free trial • No credit card required
                </p>
              </div>

              <div className="bg-muted/30 p-8 md:p-12">
                <p className="font-semibold mb-4">Everything included:</p>
                <ul className="space-y-3">
                  {[
                    "Up to 10 technicians",
                    "Unlimited jobs",
                    "Unlimited SMS messaging",
                    "Photo uploads & storage",
                    "Real-time status tracking",
                    "Customer notifications",
                    "Basic reporting & analytics",
                    "Email support",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Need more than 10 technicians? Contact us for enterprise pricing.
            </p>
            <Link href="mailto:enterprise@getdispatchly.co">
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,white,transparent_50%)]" />
            </div>
            <div className="relative z-10 p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to simplify your dispatch?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join hundreds of service companies saving hours every week with Dispatchly. Start your free trial today.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="text-base px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="mt-4 text-sm text-primary-foreground/60">
                14-day free trial • No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="mb-4">
                <Logo size="sm" />
              </Link>
              <p className="text-sm text-muted-foreground">
                Field service management made simple.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/signup" className="hover:text-foreground transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Dispatchly. All rights reserved.
            </p>
            <div className="flex gap-6">
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
