'use client';
import { useState } from 'react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('tab-intro');

  const tabs = [
    { id: 'tab-intro', label: 'Overview' },
    { id: 'tab-industry', label: 'Lifetime in Industry' },
    { id: 'tab-accomplishments', label: 'Accomplishments' },
    { id: 'tab-developing', label: 'Developing Horses & Riders' },
    { id: 'tab-approach', label: 'Horse-First Approach' },
    { id: 'tab-teaching', label: 'Teaching Philosophy' },
    { id: 'tab-next', label: 'The Next Chapter' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <header className="text-center space-y-3">
        <img
          src="/logo.png"
          alt="Cherry Blossom Equestrian Logo"
          className="w-48 mx-auto h-auto"
        />
        <p className="text-sm text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          A premier Equestrian Center in the North Metro Atlanta area, specializing in competitive hunter/jumper lesson programs and dedicated support for riders on local and rated circuits.
        </p>
      </header>

      {/* Trainer Title */}
      <div className="text-center space-y-1">
        <h2
          className="text-xs uppercase tracking-widest text-[#e8b4b8] font-semibold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Meet Our Head Trainer
        </h2>
        <h3
          className="text-2xl text-zinc-900 font-normal"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Charity R. Durgin
        </h3>
      </div>

      {/* Internal Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-1.5 border-b border-zinc-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition ${
              activeTab === tab.id
                ? 'bg-black text-[#e8b4b8] shadow-xs font-bold'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 shadow-xs min-h-[300px]">
        {activeTab === 'tab-intro' && (
          <div className="space-y-3">
            <h4
              className="text-xl font-normal text-zinc-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Welcome to Cherry Blossom Equestrian
            </h4>
            <p className="text-sm text-zinc-700 leading-relaxed">
              With more than 25 years of experience in the equestrian industry, Charity Durgin brings a lifetime of horsemanship, competitive success, program management, and a genuine passion for developing confident, educated horses and riders to Cherry Blossom Equestrian.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Use the navigation menu above to explore Charity's background, competitive accomplishments, horse-first philosophy, and teaching approach.
            </p>
          </div>
        )}

        {activeTab === 'tab-industry' && (
          <div className="space-y-3">
            <h4
              className="text-xl font-normal text-zinc-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              A Lifetime in the Equestrian Industry
            </h4>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Charity began riding at age 13 and quickly immersed herself in every aspect of the equestrian world. Being homeschooled gave her the unique opportunity to spend extensive time in the barn from an early age, gaining invaluable hands-on experience with horses both on the ground and in the saddle.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Her professional career began in the Eventing discipline, where riding a wide variety of horses helped establish the adaptable and thoughtful approach to training that remains central to her philosophy today.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              At 18, Charity joined Huntcliff Equestrian Centre in Sandy Springs, Georgia, where she continued developing as a professional rider and instructor.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              In 2006, Charity joined Falcon Ridge Stables, beginning what would become a nearly 20-year chapter of her career.
            </p>
          </div>
        )}

        {activeTab === 'tab-accomplishments' && (
          <div className="space-y-3">
            <h4
              className="text-xl font-normal text-zinc-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Competitive Accomplishments
            </h4>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Charity’s personal competitive accomplishments include championship honors at the Winter Equestrian Festival (WEF), along with numerous championships and class wins in the Adult Equitation and Adult Hunters on the rated circuit.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Her accomplishments also include winning the Southeast Adult Medal Final and GHJA Adult Medal Final, earning GHJA Adult Hunter championship honors, and receiving numerous year-end tricolors and honors through GHJA and USHJA.
            </p>
          </div>
        )}

        {activeTab === 'tab-developing' && (
          <div className="space-y-3">
            <h4
              className="text-xl font-normal text-zinc-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Developing Horses & Riders
            </h4>
            <p className="text-sm text-zinc-700 leading-relaxed">
              After returning to professional status, Charity transitioned back into professional riding, teaching, and program management at Falcon Ridge Stables. Over the following years, her responsibilities grew to include managing a large lesson and training program, riding and developing horses, teaching riders of varying ages and experience levels.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Students from the program qualified for and competed at prestigious championships including USEF Pony Finals, USEF Junior Hunter Finals, Pennsylvania National Horse Show, Washington International Horse Show, Capital Challenge Horse Show, NHS and ASPCA Maclay Finals.
            </p>
          </div>
        )}

        {activeTab === 'tab-approach' && (
          <div className="space-y-3">
            <h4
              className="text-xl font-normal text-zinc-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              A Horse-First Approach
            </h4>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Charity prides herself on being a light, soft, and sympathetic rider, and she carries that philosophy into every aspect of her training and coaching. Her first question when encountering a problem is often not simply “How do we correct this?” but “Why is this happening?”
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              She believes good horsemanship requires looking at the entire horse, understanding changes in behavior, recognizing discomfort or uncertainty, and determining whether a problem stems from training, confidence, or communication.
            </p>
          </div>
        )}

        {activeTab === 'tab-teaching' && (
          <div className="space-y-3">
            <h4
              className="text-xl font-normal text-zinc-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Teaching Through Understanding
            </h4>
            <p className="text-sm text-zinc-700 leading-relaxed">
              A cornerstone of Charity’s teaching philosophy is the belief that mistakes are an essential part of becoming an educated and capable rider. Rather than simply telling a student that something was wrong, Charity turns those moments into teaching opportunities.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Her goal is to develop riders who can think, feel, problem-solve, and eventually recognize and make appropriate corrections independently.
            </p>
          </div>
        )}

        {activeTab === 'tab-next' && (
          <div className="space-y-3">
            <h4
              className="text-xl font-normal text-zinc-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              The Next Chapter
            </h4>
            <p className="text-sm text-zinc-700 leading-relaxed">
              After nearly two decades at Falcon Ridge Stables, Charity is excited to bring the experience, relationships, and lessons accumulated throughout her career into the next chapter with Cherry Blossom Equestrian.
            </p>
            <div
              className="border-l-2 border-black pl-4 py-2 my-3 italic text-zinc-800 text-sm"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              "Put the horse first. Teach the rider the 'why.' Celebrate progress. Learn from mistakes. Never stop developing better horsemen."
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
