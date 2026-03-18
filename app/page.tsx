import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  MessageSquare, 
  Users, 
  Camera, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Phone,
  MapPin,
  Zap,
  Shield,
  BarChart3
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Dispatchly</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/tech" className="text-sm text-slate-600 hover:text-slate-900">
                Technician Portal
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              <span className="text-sm font-medium text-blue-900">Now with AI-Powered Dispatch</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-8">
              Field Service Management
              <span className="text-blue-600 block mt-2">Made Simple</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Dispatchly helps HVAC and field service companies manage jobs, dispatch technicians, 
              and communicate with customers—all through simple SMS. No apps to download.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Hero Image / Dashboard Preview */}
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-2xl bg-slate-900 p-2 shadow-2xl">
                <div className="rounded-xl bg-slate-800 p-6 text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    <div className="ml-4 text-slate-400 text-sm">dispatchly.co/dashboard</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="text-slate-400 text-xs mb-1">Active Jobs</div>
                      <div className="text-2xl font-bold text-white">12</div>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="text-slate-400 text-xs mb-1">Technicians</div>
                      <div className="text-2xl font-bold text-white">5</div>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="text-slate-400 text-xs mb-1">Completed Today</div>
                      <div className="text-2xl font-bold text-green-400">8</div>
                    </div>
                  </div>
                  <div className="mt-4 bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">JD</div>
                      <div>
                        <div className="text-white text-sm font-medium">AC Repair - John Doe</div>
                        <div className="text-slate-400 text-xs">En Route • 123 Main St</div>
                      </div>
                      <div className="ml-auto text-green-400 text-xs">Active</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Run Your Field Service Business
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From job creation to technician tracking to customer communication—Dispatchly handles it all.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">SMS-First Communication</h3>
              <p className="text-slate-600 leading-relaxed">
                Technicians and customers communicate via text—no apps to download. Automatic updates sent to customers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Smart Dispatch</h3>
              <p className="text-slate-600 leading-relaxed">
                Assign jobs to technicians instantly. Track status in real-time: scheduled, en route, working, complete.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Photo Documentation</h3>
              <p className="text-slate-600 leading-relaxed">
                Technicians upload before/after photos directly via SMS. Automatic compression and cloud storage.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Real-Time Updates</h3>
              <p className="text-slate-600 leading-relaxed">
                Customers receive automatic SMS updates when technicians are en route, working, or job is complete.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Two-Way SMS</h3>
              <p className="text-slate-600 leading-relaxed">
                Customers can reply to texts with questions or updates. All communication captured in the job log.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Reports & Analytics</h3>
              <p className="text-slate-600 leading-relaxed">
                Track job completion rates, technician performance, and customer satisfaction over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How Dispatchly Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get your team up and running in minutes, not months.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-blue-200">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Create a Job</h3>
              <p className="text-slate-600">
                Enter customer details, job type, and location. Assign to a technician or leave unassigned.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-blue-200">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Technician Gets SMS</h3>
              <p className="text-slate-600">
                Technician receives a magic link via text. No app download needed—just tap and go.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-blue-200">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Track in Real-Time</h3>
              <p className="text-slate-600">
                Watch job progress, view photos, and communicate—all from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Built for the Field
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simple, intuitive interfaces for admins and technicians.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Admin Dashboard Preview */}
            <div className="order-2 md:order-1">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Admin Dashboard</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">See all jobs at a glance with color-coded status</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">Track technician locations and availability</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">View photos uploaded from the field instantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">Full SMS conversation history for every job</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="rounded-xl bg-slate-900 p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-8 bg-slate-700 rounded"></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 bg-slate-700 rounded"></div>
                    <div className="h-20 bg-slate-700 rounded"></div>
                    <div className="h-20 bg-slate-700 rounded"></div>
                  </div>
                  <div className="h-32 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mt-20">
            {/* Technician Mobile View */}
            <div>
              <div className="rounded-xl bg-slate-900 p-4 shadow-2xl max-w-sm mx-auto">
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="text-white font-semibold">Your Jobs</div>
                    <div className="text-slate-400 text-xs">3 Active</div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-white text-sm">AC Repair</span>
                      </div>
                      <div className="text-slate-400 text-xs">123 Main St</div>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <span className="text-white text-sm">HVAC Install</span>
                      </div>
                      <div className="text-slate-400 text-xs">456 Oak Ave</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="flex-1 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
                      Update Status
                    </div>
                    <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Technician Mobile View</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">No app download—works in any web browser</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">One-tap status updates: En Route → Working → Complete</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">Upload photos directly from phone camera</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">See job details, customer info, and navigation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Trusted by Field Service Teams
            </h2>
            <p className="text-lg text-slate-600">
              See what our customers have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 mb-6">
                "Dispatchly cut our administrative time in half. Technicians love the simple text-based updates, and customers appreciate the real-time notifications."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  MK
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Mike K.</div>
                  <div className="text-sm text-slate-500">HVAC Pro Services</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 mb-6">
                "We tried three other dispatch software solutions. Dispatchly was the only one our technicians actually wanted to use. The SMS magic links are genius."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                  SJ
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Sarah J.</div>
                  <div className="text-sm text-slate-500">Quick Fix Plumbing</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 mb-6">
                "Setup took 10 minutes. Now we can finally track job completion rates and identify our top performers. Game changer for our business."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                  DR
                </div>
                <div>
                  <div className="font-semibold text-slate-900">David R.</div>
                  <div className="text-sm text-slate-500">Elite Electric Co.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Streamline Your Field Service Business?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join hundreds of contractors who've simplified their dispatch with Dispatchly. 
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700 text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-sm text-blue-200">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Dispatchly</span>
              </div>
              <p className="text-sm text-slate-400">
                SMS-first dispatch software for field service teams. No apps. No hassle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/tech" className="hover:text-white">Technician Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#about" className="hover:text-white">About</Link></li>
                <li><Link href="#contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="#privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/signup" className="hover:text-white">Get Started</Link></li>
                <li><Link href="/tech" className="hover:text-white">Technician Help</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © 2026 Dispatchly. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">Secure, encrypted, and reliable</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
