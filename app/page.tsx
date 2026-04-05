import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lightning, Target, FileText } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Build ATS-Friendly CVs in Minutes
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Create professional, optimized CVs that get past applicant tracking systems.
          Real-time preview, instant PDF export, completely free.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <Link href="/templates">
            <Button size="lg" variant="outline">Browse Templates</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <HugeiconsIcon icon={Lightning} className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Preview</h3>
              <p className="text-muted-foreground">
                See your changes instantly as you edit. No more guessing how it looks.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <HugeiconsIcon icon={Target} className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ATS Optimized</h3>
              <p className="text-muted-foreground">
                Our templates are designed to pass applicant tracking systems with flying colors.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <HugeiconsIcon icon={FileText} className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant PDF Export</h3>
              <p className="text-muted-foreground">
                Download your CV as a PDF in seconds. Perfect for applications and uploads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Build Your CV?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of job seekers who have landed their dream jobs.
        </p>
        <Link href="/signup">
          <Button size="lg">Create Your Free Account</Button>
        </Link>
      </section>
    </div>
  )
}
