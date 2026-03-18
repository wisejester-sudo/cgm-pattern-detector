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
          <Badge className="mb-4">Technology</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Why Your Technicians Hate Your Current Software
          </h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-2"><User className="h-4 w-4" />Sarah Chen</span>
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />March 10, 2026</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" />4 min read</span>
          </div>
          
          <div className="w-full h-64 sm:h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-8 flex items-center justify-center">
            <span className="text-muted-foreground">Featured Image: Frustrated Technician</span>
          </div>
        </div>
      </section>

      <article className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <p className="lead text-xl text-muted-foreground mb-8">
            You spent thousands on field service software. The demos looked amazing. But three months later, your technicians are still using paper. What went wrong?
          </p>

          <h2>The Adoption Problem</h2>
          <p>
            Here is the hard truth: most field service software fails not because of missing features, but because technicians will not use it. When your team does not use the software, you are back to managing everything through spreadsheets.
          </p>

          <h2>Reason 1: Too Many Apps</h2>
          <p>
            Your technicians already have dozens of apps. The last thing they want is another app requiring login, draining battery, and taking up storage.
          </p>

          <h2>Reason 2: Complicated Workflows</h2>
          <p>
            Technicians are skilled tradespeople, not software experts. When dispatch requires six taps to update status or three menus to find customer info, they give up.
          </p>

          <h2>Reason 3: Poor Mobile Experience</h2>
          <p>
            Many platforms were built for desktop first. The result? Tiny buttons, confusing navigation, and forms impossible to fill on a 6-inch screen while wearing work gloves.
          </p>

          <h2>What Actually Works: SMS</h2>
          <p>
            The most successful field service tools do not require apps at all. They use text messaging. SMS has a 98% open rate versus 20% for emails.
          </p>

          <div className="my-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="font-medium mb-2">Ready for software your technicians will use?</p>
            <p className="text-sm text-muted-foreground mb-4">
              Dispatchly works through SMS—no apps, no passwords. Your technicians already know how to text.
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
