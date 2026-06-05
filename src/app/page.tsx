import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  CreditCard,
  Palette,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: FileText,
    title: "File Sharing",
    description:
      "Upload deliverables and organize them by project. Clients see a clean, professional view.",
  },
  {
    icon: MessageSquare,
    title: "Feedback & Approvals",
    description:
      "Clients comment directly on files and approve with one click. No more email threads.",
  },
  {
    icon: CreditCard,
    title: "Built-in Invoicing",
    description:
      "Send invoices and accept payments right inside the portal. Powered by Stripe.",
  },
  {
    icon: Palette,
    title: "Custom Branding",
    description:
      "Your logo, your colors. Every portal looks like it's part of your brand.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description:
      "Every portal has a unique secure link. No client login required — simple and safe.",
  },
  {
    icon: Zap,
    title: "60-Second Setup",
    description:
      "Create a portal, upload files, share the link. That's it. No onboarding marathon.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying it out",
    features: [
      "2 client portals",
      "1GB file storage",
      "Basic file sharing",
      "ClientVault branding",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For freelancers who mean business",
    features: [
      "25 client portals",
      "10GB file storage",
      "Custom branding",
      "Invoicing & payments",
      "Email notifications",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Agency",
    price: "$49",
    period: "/month",
    description: "For teams that scale",
    features: [
      "Unlimited portals",
      "50GB file storage",
      "White-label (no branding)",
      "Team seats",
      "Advanced analytics",
      "API access",
      "Dedicated support",
    ],
    cta: "Start Agency Trial",
    popular: false,
  },
];

const testimonials = [
  {
    quote:
      "ClientVault replaced three tools for me. My clients love how professional everything looks.",
    author: "Sarah Chen",
    role: "Freelance Designer",
  },
  {
    quote:
      "The approval workflow alone saves me hours of back-and-forth emails every week.",
    author: "Marcus Rodriguez",
    role: "Agency Owner",
  },
  {
    quote:
      "I set up my first portal in under a minute. My client was impressed. So was I.",
    author: "Emma Blackwell",
    role: "Web Developer",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">ClientVault</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                Get Started Free
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-1.5 text-sm font-medium"
            >
              ✨ Trusted by 500+ freelancers and agencies
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              One link.{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Every client.
              </span>
              <br />
              Zero chaos.
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              Share files, collect feedback, get approvals, and accept payments —
              all in one beautiful, branded client portal. Set up in 60 seconds.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="px-8 text-base">
                  Start Free — No Credit Card
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="px-8 text-base">
                  See How It Works
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free plan includes 2 portals. No credit card required.
            </p>
          </div>

          {/* Hero Visual */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="rounded-xl border bg-gradient-to-b from-muted/50 to-muted p-4 shadow-2xl">
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="ml-4 h-6 flex-1 rounded bg-muted" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-3">
                    <div className="h-8 rounded bg-indigo-100 dark:bg-indigo-900/30" />
                    <div className="h-6 rounded bg-muted" />
                    <div className="h-6 rounded bg-muted" />
                    <div className="h-6 rounded bg-muted" />
                    <div className="h-6 rounded bg-muted" />
                  </div>
                  <div className="col-span-2 space-y-3">
                    <div className="h-32 rounded bg-muted" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-20 rounded bg-indigo-50 dark:bg-indigo-900/20" />
                      <div className="h-20 rounded bg-purple-50 dark:bg-purple-900/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            ClientVault combines file sharing, feedback, and invoicing into one
            simple tool that your clients will actually enjoy using.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 mb-2">
                  <feature.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps. Sixty seconds.
            </h2>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create a Portal",
                desc: "Enter your client's name and hit create. Done.",
              },
              {
                step: "2",
                title: "Upload Files",
                desc: "Drag and drop your deliverables. Organized instantly.",
              },
              {
                step: "3",
                title: "Share the Link",
                desc: "Send the unique portal link. Clients view, comment, approve.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white text-lg font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {pricing.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-indigo-600 shadow-lg scale-105"
                  : "border shadow-sm"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-indigo-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="border-y bg-muted/30 py-24"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by people who build for people
            </h2>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.author} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-sm">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to impress your clients?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Create your first portal in 60 seconds. Free forever — no credit
            card required.
          </p>
          <Link href="/login">
            <Button size="lg" className="mt-8 px-8 text-base">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600">
                <Shield className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold">ClientVault</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="mailto:support@clientvault.app"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ClientVault. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
