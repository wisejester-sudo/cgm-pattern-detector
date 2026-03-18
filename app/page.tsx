import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Users, 
  Camera, 
  CheckCircle2, 
  ArrowRight,
  Zap,
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
  ChevronRight
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Dispatchly</span>
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
              <Badge className="mb-6 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                Now with AI-Powered Dispatch
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Field service management{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  without the headache
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Dispatchly helps HVAC companies manage jobs, dispatch technicians, and keep customers informed—all through simple SMS. No apps to download, no training required.
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

            {/* Hero Image */}
            <div className="relative lg:pl-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-3xl opacity-50" />
              <div className="relative bg-card border rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Active Jobs</div>
                      <div className="text-2xl font-bold">12</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Technicians</div>
                      <div className="text-2xl font-bold">5</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Completed</div>
                      <div className="text-2xl font-bold text-green-500">8</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "Mike Smith", status: "En Route", time: "10:30 AM", color: "bg-blue-500" },
                      { name: "Sarah Johnson", status: "Working", time: "11:15 AM", color: "bg-yellow-500" },
                      { name: "David Park", status: "Complete", time: "9:45 AM", color: "bg-green-500" },
                    ].map((tech, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${tech.color}`} />
                          <span className="text-sm font-medium">{tech.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{tech.status}</span>
                          <span className="text-xs text-muted-foreground">{tech.time}</span>
                        </div>
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
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "HVAC Companies" },
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Workflow,
                title: "Job Management",
                description: "Create, assign, and track jobs from start to finish. Real-time status updates keep everyone informed."
              },
              {
                icon: MessageSquare,
                title: "SMS Communication",
                description: "Two-way texting with customers and technicians. No apps to download or install."
              },
              {
                icon: Camera,
                title: "Photo Management",
                description: "Technicians upload photos from the field. Customers view them instantly via web link."
              },
              {
                icon: Users,
                title: "Team Management",
                description: "Invite technicians with magic links. No passwords to remember or manage."
              },
              {
                icon: Bell,
                title: "Real-time Updates",
                description: "Automatic notifications when jobs are updated. Customers know exactly when you arrive."
              },
              {
                icon: BarChart3,
                title: "Reporting & Analytics",
                description: "Track performance metrics, completion rates, and customer satisfaction over time."
              },
            ].map((feature, i) => (
              <div key={i} className="group relative p-6 bg-card border rounded-2xl hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
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
                description: "Enter customer details and assign a technician. Takes less than 60 seconds."
              },
              {
                step: "02",
                title: "Tech Gets Notified",
                description: "Technician receives an SMS with job details and a magic link to update status."
              },
              {
                step: "03",
                title: "Everyone Stays Informed",
                description: "Customers get automatic updates when techs are en route, working, and complete."
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-bold text-primary/10 leading-none mb-4">{item.step}</div>
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
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by HVAC professionals
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
                role: "Owner, Cool Air HVAC",
                rating: 5
              },
              {
                quote: "Our customers love the text updates. They know exactly when we're arriving and what to expect.",
                author: "Sarah Chen",
                role: "Dispatch Manager, Summit Heating",
                rating: 5
              },
              {
                quote: "We tried 3 other systems. Dispatchly was the only one our technicians actually used without complaining.",
                author: "David Park",
                role: "Operations Director, FrostGuard",
                rating: 5
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-card border rounded-2xl p-6 shadow-sm">
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

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
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

              <div className="bg-muted/50 p-8 md:p-12">
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
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-50" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to simplify your dispatch?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join hundreds of HVAC companies saving hours every week with Dispatchly. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-base px-8">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-primary-foreground/60">
                14-day free trial • No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">Dispatchly</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Field service management made simple. Built for HVAC companies.
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
