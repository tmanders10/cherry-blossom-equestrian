'use client';
import Link from 'next/link';
import { Award, ChevronRight, MapPin, Heart, Shield, Sparkles, Phone, Mail } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Hero Section */}
      <header className="text-center space-y-4 pt-2">
        <div className="inline-block relative">
          <img
            src="/logo.png"
            alt="Cherry Blossom Equestrian Logo"
            className="w-44 md:w-52 mx-auto h-auto"
          />
        </div>

        <div className="space-y-2">
          <span
            className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold block"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            North Metro Atlanta • Hunter / Jumper Program
          </span>
          <h1
            className="text-3xl md:text-4xl text-zinc-900 font-normal tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Welcome to Cherry Blossom Equestrian
          </h1>
          <p className="text-sm md:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed pt-1">
            A premier equestrian program dedicated to developing educated, confident riders and athletic, happy horses. Specializing in competitive hunter/jumper lesson programs, thoughtful horsemanship, and dedicated support for riders on local and rated circuits.
          </p>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 max-w-3xl mx-auto">
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-center shadow-2xs">
            <span className="block text-xs font-bold text-zinc-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>25+ Years</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Industry Experience</span>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-center shadow-2xs">
            <span className="block text-xs font-bold text-zinc-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Hunters & Jumpers</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Equitation Focus</span>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-center shadow-2xs">
            <span className="block text-xs font-bold text-zinc-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>GHJA & USEF</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Circuit Coaching</span>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-center shadow-2xs">
            <span className="block text-xs font-bold text-zinc-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Horse-First</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">True Horsemanship</span>
          </div>
        </div>
      </header>

      {/* Full-Width Head Trainer Feature Showcase */}
      <div className="pt-2">
        <Link
          href="/trainer"
          className="group block bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white rounded-2xl p-6 md:p-8 shadow-lg border border-zinc-800 hover:border-[#e8b4b8]/60 transition relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#e8b4b8]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] uppercase tracking-widest text-[#e8b4b8] font-semibold"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Leadership & Instruction
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-[11px] text-zinc-400">Head Trainer</span>
              </div>

              <h2
                className="text-2xl md:text-3xl font-normal text-white group-hover:text-[#e8b4b8] transition"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Charity R. Durgin
              </h2>

              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                With more than 25 years of horsemanship, championship honors at the Winter Equestrian Festival (WEF), and a proven record of guiding riders to prestigious national medal and equitation finals, Charity brings a compassionate, educated, and horse-first approach to Cherry Blossom Equestrian.
              </p>

              <div
                className="border-l-2 border-[#e8b4b8]/70 pl-3 py-1 text-xs italic text-[#e8b4b8]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                "Put the horse first. Teach the rider the 'why.' Celebrate progress. Learn from mistakes. Never stop developing better horsemen."
              </div>
            </div>

            {/* Right Side Badges & CTA */}
            <div className="flex flex-col sm:items-end justify-between gap-4 shrink-0 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
              <div className="flex flex-wrap md:flex-col gap-1.5 sm:items-end text-left sm:text-right">
                <span className="px-2.5 py-1 bg-zinc-800/90 border border-zinc-700/60 rounded-md text-[11px] font-semibold text-zinc-200">
                  25+ Years Experience
                </span>
                <span className="px-2.5 py-1 bg-zinc-800/90 border border-zinc-700/60 rounded-md text-[11px] font-semibold text-zinc-200">
                  WEF & Medal Finalist
                </span>
                <span className="px-2.5 py-1 bg-zinc-800/90 border border-zinc-700/60 rounded-md text-[11px] font-semibold text-zinc-200">
                  Maclay & Pony Finals Coach
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-zinc-950 font-bold rounded-lg text-xs group-hover:bg-[#e8b4b8] transition shadow-xs">
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Read Charity's Biography</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Program Pillars */}
      <section className="space-y-4 pt-2">
        <div className="text-center space-y-1">
          <h2
            className="text-xs uppercase tracking-widest text-[#e8b4b8] font-semibold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Our Core Values
          </h2>
          <h3
            className="text-2xl text-zinc-900 font-normal"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            The Cherry Blossom Standard
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#e8b4b8] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h4
              className="text-base font-semibold text-zinc-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Systematic Progression
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Every lesson builds upon solid fundamentals. We focus on developing riders who can independently think, feel, problem-solve, and communicate effectively with their mounts.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#e8b4b8] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4
              className="text-base font-semibold text-zinc-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Circuit Show Support
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Whether competing on the local GHJA circuit or qualifying for national USEF indoor finals, our program provides dedicated preparation, course strategy, and ringside coaching.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#e8b4b8] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <h4
              className="text-base font-semibold text-zinc-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              The Horse-First Philosophy
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              A sympathetic, soft approach. We view horsemanship holistically, recognizing changes in demeanor, ensuring physical comfort, and fostering trust between rider and horse.
            </p>
          </div>
        </div>
      </section>

      {/* Location & Inquiries Section */}
      <footer className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 md:p-8 text-center space-y-4 shadow-2xs">
        <div className="space-y-1">
          <span
            className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold block"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Location & Contact
          </span>
          <h3
            className="text-xl md:text-2xl text-zinc-900 font-normal"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Connect with Cherry Blossom Equestrian
          </h3>
          <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed pt-0.5">
            Conveniently located for equestrian families in Roswell, Alpharetta, Milton, Canton, Woodstock, and surrounding North Metro Atlanta communities.
          </p>
        </div>

        {/* Contact Badges: Phone, Email, Location */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <a
            href="tel:7702492205"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg text-xs font-semibold text-zinc-900 shadow-2xs transition hover:shadow-xs group cursor-pointer"
            title="Call Charity Durgin"
          >
            <Phone className="w-3.5 h-3.5 text-zinc-700 group-hover:text-[#e8b4b8] transition shrink-0" />
            <span>(770) 249-2205</span>
          </a>

          <a
            href="mailto:trainer@cherryblossomequestrian.com"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg text-xs font-semibold text-zinc-900 shadow-2xs transition hover:shadow-xs group cursor-pointer"
            title="Email Charity Durgin"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-700 group-hover:text-[#e8b4b8] transition shrink-0" />
            <span>trainer@cherryblossomequestrian.com</span>
          </a>

          <a
            href="https://maps.google.com/?q=13355+Arnold+Mill+Rd,+Roswell,+GA+30075"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg text-xs font-semibold text-zinc-900 shadow-2xs transition hover:shadow-xs group cursor-pointer"
            title="Open location in Google Maps"
          >
            <MapPin className="w-3.5 h-3.5 text-zinc-700 group-hover:text-[#e8b4b8] transition shrink-0" />
            <span>13355 Arnold Mill Rd, Roswell, GA 30075</span>
          </a>
        </div>

        <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
          For lesson program inquiries, evaluation sessions, or training questions, please call or email Charity directly.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/trainer"
            className="px-5 py-2.5 bg-black text-[#e8b4b8] hover:bg-zinc-800 rounded-lg text-xs font-bold transition shadow-xs"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Meet Head Trainer Charity Durgin
          </Link>
        </div>
      </footer>
    </div>
  );
}
