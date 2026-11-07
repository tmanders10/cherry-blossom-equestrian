'use client';
import { useState } from 'react';
import { Award, BookOpen, Compass, Heart, Sparkles, Trophy, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function TrainerBioPage() {
  const [expandedSections, setExpandedSections] = useState({
    industry: false,
    accomplishments: false,
    developing: false,
    approach: false,
    teaching: false,
    next: false,
  });

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setExpandedSections({
      industry: true,
      accomplishments: true,
      developing: true,
      approach: true,
      teaching: true,
      next: true,
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      industry: false,
      accomplishments: false,
      developing: false,
      approach: false,
      teaching: false,
      next: false,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Profile Header */}
      <header className="bg-gradient-to-b from-zinc-900 to-black text-white rounded-2xl p-5 md:p-7 shadow-lg border border-zinc-800 text-center space-y-3 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#e8b4b8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1">
          <span
            className="text-[11px] uppercase tracking-widest text-[#e8b4b8] font-semibold block"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Head Trainer & Program Director
          </span>
          <h1
            className="text-2xl md:text-4xl text-white font-normal"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Charity R. Durgin
          </h1>
          <p className="text-xs md:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed pt-0.5">
            Bringing more than 25 years of horsemanship, competitive excellence, and a lifelong dedication to developing educated, confident horses and riders.
          </p>
        </div>

        {/* 4 Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 max-w-2xl mx-auto text-left">
          <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-lg p-2.5">
            <div className="text-[#e8b4b8] font-bold text-xs sm:text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>25+ Years</div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Industry Career</div>
          </div>
          <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-lg p-2.5">
            <div className="text-[#e8b4b8] font-bold text-xs sm:text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>WEF Champion</div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Winter Equestrian Fest</div>
          </div>
          <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-lg p-2.5">
            <div className="text-[#e8b4b8] font-bold text-xs sm:text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Medal Finalist</div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Southeast & GHJA</div>
          </div>
          <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-lg p-2.5">
            <div className="text-[#e8b4b8] font-bold text-xs sm:text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>National Coach</div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Maclay & Pony Finals</div>
          </div>
        </div>

        {/* Quote Banner */}
        <div className="pt-1">
          <div
            className="border-l-2 border-[#e8b4b8] pl-3 py-1.5 italic text-[#e8b4b8] text-xs text-left max-w-xl mx-auto bg-zinc-900/50 rounded-r-lg"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            "Put the horse first. Teach the rider the 'why.' Celebrate progress. Learn from mistakes. Never stop developing better horsemen."
          </div>
        </div>
      </header>

      {/* Expand / Collapse Controls */}
      <div className="flex items-center justify-end gap-1.5 text-xs px-1 text-zinc-500">
        <button
          onClick={expandAll}
          className="hover:text-black font-medium transition cursor-pointer"
        >
          Expand All
        </button>
        <span className="text-zinc-300">•</span>
        <button
          onClick={collapseAll}
          className="hover:text-black font-medium transition cursor-pointer"
        >
          Collapse All
        </button>
      </div>

      {/* Bio Sections (Mobile-Optimized Clean Cards, Default Collapsed, Unified Icon Badges) */}
      <div className="space-y-3.5">
        {/* SECTION 1: INDUSTRY BACKGROUND */}
        <section
          id="sec-industry"
          className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs transition"
        >
          <button
            onClick={() => toggleSection('industry')}
            className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#e8b4b8] flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <h2
                className="text-base md:text-lg font-semibold text-zinc-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                A Lifetime in the Equestrian Industry
              </h2>
            </div>
            {expandedSections.industry ? (
              <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
          </button>

          {expandedSections.industry && (
            <div className="px-5 pb-5 pt-1 space-y-3 text-xs md:text-sm text-zinc-700 leading-relaxed border-t border-zinc-100">
              <p>
                Charity began riding at age 13 and quickly immersed herself in every aspect of the equestrian world. Being homeschooled gave her the unique opportunity to spend extensive time in the barn from an early age, gaining invaluable hands-on experience with horses both on the ground and in the saddle.
              </p>
              <p>
                Her professional career began in the Eventing discipline, where riding a wide variety of horses helped establish the adaptable, thoughtful approach to training that remains central to her philosophy today.
              </p>
              <p>
                At 18, Charity joined Huntcliff Equestrian Centre in Sandy Springs, Georgia, where she continued developing as a professional rider and instructor. In 2006, Charity joined Falcon Ridge Stables, beginning what would become a nearly 20-year chapter of her career.
              </p>
            </div>
          )}
        </section>

        {/* SECTION 2: COMPETITIVE ACCOMPLISHMENTS */}
        <section
          id="sec-accomplishments"
          className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs transition"
        >
          <button
            onClick={() => toggleSection('accomplishments')}
            className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#e8b4b8] flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <h2
                className="text-base md:text-lg font-semibold text-zinc-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Competitive Accomplishments
              </h2>
            </div>
            {expandedSections.accomplishments ? (
              <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
          </button>

          {expandedSections.accomplishments && (
            <div className="px-5 pb-5 pt-1 space-y-3.5 text-xs md:text-sm text-zinc-700 leading-relaxed border-t border-zinc-100">
              <p>
                Charity’s personal competitive accomplishments include championship honors at the Winter Equestrian Festival (WEF), along with numerous championships and class wins in the Adult Equitation and Adult Hunters on the rated circuit.
              </p>
              <p>
                Her accomplishments also include winning the Southeast Adult Medal Final and GHJA Adult Medal Final, earning GHJA Adult Hunter championship honors, and receiving numerous year-end tricolors and honors through GHJA and USHJA.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-900 block text-xs">Southeast Adult Medal Final</span>
                    <span className="text-[11px] text-zinc-600">Champion & Title Winner</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-900 block text-xs">GHJA Adult Medal Final</span>
                    <span className="text-[11px] text-zinc-600">Champion & Year-End Honors</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-900 block text-xs">GHJA Adult Hunter Division</span>
                    <span className="text-[11px] text-zinc-600">Championship Titles</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-900 block text-xs">Rated Circuit Honors</span>
                    <span className="text-[11px] text-zinc-600">GHJA & USHJA Year-End Tricolors</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 3: DEVELOPING HORSES & RIDERS */}
        <section
          id="sec-developing"
          className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs transition"
        >
          <button
            onClick={() => toggleSection('developing')}
            className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#e8b4b8] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2
                className="text-base md:text-lg font-semibold text-zinc-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Developing Horses & Riders
              </h2>
            </div>
            {expandedSections.developing ? (
              <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
          </button>

          {expandedSections.developing && (
            <div className="px-5 pb-5 pt-1 space-y-3 text-xs md:text-sm text-zinc-700 leading-relaxed border-t border-zinc-100">
              <p>
                After returning to professional status, Charity transitioned back into professional riding, teaching, and program management at Falcon Ridge Stables. Over the following years, her responsibilities grew to include managing a large lesson and training program, riding and developing horses, teaching riders of varying ages and experience levels.
              </p>
              <p>
                Students from the program qualified for and competed at prestigious championships across the country:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-zinc-800 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                <li className="flex items-center gap-1.5">• USEF Pony Finals</li>
                <li className="flex items-center gap-1.5">• USEF Junior Hunter Finals</li>
                <li className="flex items-center gap-1.5">• Pennsylvania National Horse Show</li>
                <li className="flex items-center gap-1.5">• Washington International Horse Show</li>
                <li className="flex items-center gap-1.5">• Capital Challenge Horse Show</li>
                <li className="flex items-center gap-1.5">• NHS and ASPCA Maclay Finals</li>
              </ul>
            </div>
          )}
        </section>

        {/* SECTION 4: HORSE-FIRST APPROACH */}
        <section
          id="sec-approach"
          className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs transition"
        >
          <button
            onClick={() => toggleSection('approach')}
            className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#e8b4b8] flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <h2
                className="text-base md:text-lg font-semibold text-zinc-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                A Horse-First Approach
              </h2>
            </div>
            {expandedSections.approach ? (
              <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
          </button>

          {expandedSections.approach && (
            <div className="px-5 pb-5 pt-1 space-y-3 text-xs md:text-sm text-zinc-700 leading-relaxed border-t border-zinc-100">
              <p>
                Charity prides herself on being a light, soft, and sympathetic rider, and she carries that philosophy into every aspect of her training and coaching. Her first question when encountering a problem is often not simply <em>“How do we correct this?”</em> but <strong>“Why is this happening?”</strong>
              </p>
              <p>
                She believes good horsemanship requires looking at the entire horse, understanding changes in behavior, recognizing discomfort or uncertainty, and determining whether a problem stems from training, confidence, or communication.
              </p>
            </div>
          )}
        </section>

        {/* SECTION 5: TEACHING PHILOSOPHY */}
        <section
          id="sec-teaching"
          className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs transition"
        >
          <button
            onClick={() => toggleSection('teaching')}
            className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#e8b4b8] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2
                className="text-base md:text-lg font-semibold text-zinc-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Teaching Through Understanding
              </h2>
            </div>
            {expandedSections.teaching ? (
              <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
          </button>

          {expandedSections.teaching && (
            <div className="px-5 pb-5 pt-1 space-y-3 text-xs md:text-sm text-zinc-700 leading-relaxed border-t border-zinc-100">
              <p>
                A cornerstone of Charity’s teaching philosophy is the belief that mistakes are an essential part of becoming an educated and capable rider. Rather than simply telling a student that something was wrong, Charity turns those moments into teaching opportunities.
              </p>
              <p>
                Her goal is to develop riders who can think, feel, problem-solve, and eventually recognize and make appropriate corrections independently.
              </p>
            </div>
          )}
        </section>

        {/* SECTION 6: THE NEXT CHAPTER */}
        <section
          id="sec-next"
          className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs transition"
        >
          <button
            onClick={() => toggleSection('next')}
            className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#e8b4b8] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <h2
                className="text-base md:text-lg font-semibold text-zinc-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                The Next Chapter
              </h2>
            </div>
            {expandedSections.next ? (
              <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
          </button>

          {expandedSections.next && (
            <div className="px-5 pb-5 pt-1 space-y-3 text-xs md:text-sm text-zinc-700 leading-relaxed border-t border-zinc-100">
              <p>
                After nearly two decades at Falcon Ridge Stables, Charity is excited to bring the experience, relationships, and lessons accumulated throughout her career into this next chapter with Cherry Blossom Equestrian.
              </p>
              <div
                className="border-l-2 border-black pl-4 py-2 my-3 italic text-zinc-800 text-sm"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                "Put the horse first. Teach the rider the 'why.' Celebrate progress. Learn from mistakes. Never stop developing better horsemen."
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Program Inquiry Footer */}
      <footer className="bg-zinc-900 text-white rounded-2xl p-6 md:p-8 text-center space-y-3 shadow-md border border-zinc-800">
        <h3
          className="text-xl md:text-2xl text-white font-normal"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Train with Charity at Cherry Blossom Equestrian
        </h3>
        <p className="text-xs md:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
          For lesson program inquiries, evaluation sessions, or training questions, reach out directly to learn more about joining our barn.
        </p>
      </footer>
    </div>
  );
}
