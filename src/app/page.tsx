"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  CreditCard,
  FileText,
  Clock,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- Components ---

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
      scrolled ? "bg-[#0b0c15]/80 backdrop-blur-md border-[var(--border)]" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">F</div>
          <span className="font-heading font-bold text-xl tracking-tight text-white">Freelancer<span className="text-blue-500">Shield</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "About"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              {item}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</Link>
          <Link href="/signup" className="group relative px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.6)] overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-[#0b0c15] border-b border-[var(--border)] p-6 flex flex-col gap-4 animate-slide-up">
          {["Features", "Pricing", "About"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="text-gray-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
              {item}
            </Link>
          ))}
          <div className="h-px bg-gray-800 my-2" />
          <Link href="/login" className="flex justify-center w-full py-3 text-gray-300" onClick={() => setMobileMenuOpen(false)}>Login</Link>
          <Link href="/signup" className="flex justify-center w-full py-3 bg-blue-600 rounded-lg text-white font-medium" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  )
}

const Hero = () => {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0b0c15] to-[#0b0c15]" />
      <motion.div style={{ y: y1, x: -100 }} className="absolute top-20 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <motion.div style={{ y: y2, x: 100 }} className="absolute top-40 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          v2.0 is now live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-white mb-6 leading-[1.1]"
        >
          Shield Your <br className="hidden md:block" />
          <span className="text-gradient">Freelance Business</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed"
        >
          The all-in-one workspace for payments, contracts, and client management.
          Stop juggling tools and start focusing on your craft.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/demo" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
            Watch Demo
          </Link>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-20" />
          <div className="relative rounded-xl border border-white/10 bg-[#0b0c15]/80 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[16/9]">
            {/* Mock Header */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="mx-auto w-64 h-6 rounded-md bg-white/5" />
            </div>
            {/* Mock Content */}
            <div className="p-8 grid grid-cols-12 gap-6 h-full">
              <div className="col-span-3 space-y-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-10 rounded-lg bg-white/5" />)}
              </div>
              <div className="col-span-9 grid grid-cols-2 gap-6">
                <div className="col-span-2 h-48 rounded-xl bg-white/5 border border-white/5 p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="h-8 w-32 bg-white/10 rounded mb-4" />
                  <div className="h-24 w-full bg-white/5 rounded-lg" />
                </div>
                <div className="h-48 rounded-xl bg-white/5 border border-white/5" />
                <div className="h-48 rounded-xl bg-white/5 border border-white/5" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300">
    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-6 h-6 text-blue-400" />
    </div>
    <h3 className="text-xl font-heading font-semibold text-white mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
)

const Features = () => (
  <section id="features" className="py-24 relative bg-[#0b0c15]">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">Built for the modern <span className="text-gradient">Independent</span></h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Everything you need to run your freelance business professionally, without the enterprise complexity.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon={CreditCard}
          title="Global Payments"
          desc="Accept payments in 135+ currencies. Stripe integration ensures you get paid fast and securely."
        />
        <FeatureCard
          icon={FileText}
          title="Smart Contracts"
          desc="Create legally binding contracts with digital signatures. Protect yourself before starting work."
        />
        <FeatureCard
          icon={Globe}
          title="Client Portal"
          desc="Give clients a professional dashboard to view project progress, approve milestones, and pay invoices."
        />
        <FeatureCard
          icon={Zap}
          title="Instant Invoicing"
          desc="Generate beautiful invoices in seconds. recurring billing and automated reminders included."
        />
        <FeatureCard
          icon={ShieldCheck}
          title="Project Milestones"
          desc="Break down big projects into funded milestones. release funds only when work is approved."
        />
        <FeatureCard
          icon={Clock}
          title="Time Tracking"
          desc="Track billable hours effortlessly and convert them directly into invoices with one click."
        />
      </div>
    </div>
  </section>
)

const PricingCard = ({ tier, price, features, recommended = false }: { tier: string, price: string, features: string[], recommended?: boolean }) => (
  <div className={cn(
    "relative p-8 rounded-2xl border transition-all duration-300 flex flex-col",
    recommended
      ? "bg-white/[0.04] border-blue-500/50 shadow-2xl shadow-blue-500/10 scale-105 z-10"
      : "bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]"
  )}>
    {recommended && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white uppercase tracking-wide">
        Most Popular
      </div>
    )}
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-300 mb-2">{tier}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-white">${price}</span>
        <span className="text-gray-500">/mo</span>
      </div>
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
          <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
          {feature}
        </li>
      ))}
    </ul>
    <Link
      href="/signup"
      className={cn(
        "w-full py-3 rounded-lg font-medium transition-all text-center",
        recommended
          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
          : "bg-white/[0.05] hover:bg-white/[0.1] text-white"
      )}
    >
      Get Started
    </Link>
  </div>
)

const Pricing = () => (
  <section id="pricing" className="py-24 relative overflow-hidden bg-[#0b0c15]">
    <div className="container mx-auto px-6 relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">Simple, transparent <span className="text-gradient">Pricing</span></h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Start for free, upgrade as you grow. No hidden fees.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
        <PricingCard
          tier="Starter"
          price="0"
          features={["3 Active Projects", "Basic Invoicing", "Client Portal", "5% Transaction Fee"]}
        />
        <PricingCard
          tier="Pro"
          price="29"
          features={["Unlimited Projects", "Advanced Contracts", "Custom Branding", "1% Transaction Fee", "Priority Support"]}
          recommended
        />
        <PricingCard
          tier="Agency"
          price="99"
          features={["Everything in Pro", "Team Members", "API Access", "0% Transaction Fee", "Dedicated Account Manager"]}
        />
      </div>
    </div>
  </section>
)

const Footer = () => (
  <footer className="py-12 border-t border-white/[0.05] bg-[#0b0c15]">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">F</div>
            <span className="font-heading font-bold text-xl tracking-tight text-white">Freelancer<span className="text-blue-500">Shield</span></span>
          </Link>
          <p className="text-gray-400 max-w-sm">Empowering the world's independent workforce with professional tools and financial security.</p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="#features" className="hover:text-blue-400 transition-colors">Features</Link></li>
            <li><Link href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
            <li><Link href="/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-sm text-gray-600 pt-8 border-t border-white/[0.05]">
        © {new Date().getFullYear()} FreelancerShield. All rights reserved.
      </div>
    </div>
  </footer>
)

// --- Main Page ---

export default function Home() {
  return (
    <div className="bg-[#0b0c15] min-h-screen text-white selection:bg-blue-500/30">
      <LandingNavbar />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  )
}
