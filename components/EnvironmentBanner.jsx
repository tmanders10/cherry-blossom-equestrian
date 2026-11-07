'use client';
import { useState, useEffect } from 'react';
import { AlertTriangle, Terminal, ExternalLink } from 'lucide-react';

import { getAppEnvironment } from '../lib/envUtils';

export default function EnvironmentBanner() {
  const [env, setEnv] = useState(null); // 'test' | 'dev' | null

  useEffect(() => {
    const detected = getAppEnvironment();
    setEnv(detected === 'prod' ? null : detected);
  }, []);

  // In production, render nothing (pristine live site)
  if (!env) return null;

  if (env === 'test') {
    return (
      <div className="bg-amber-400 text-amber-950 px-3 py-1.5 text-xs font-bold border-b border-amber-500 shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-900 shrink-0" />
            <span className="truncate">
              <strong>TEST ENVIRONMENT</strong> (dev.cherryblossomequestrian.com) — QA Only
            </span>
          </div>

          <a
            href="https://cherryblossomequestrian.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-0.5 rounded bg-black text-amber-200 hover:text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition shadow-2xs"
            title="Go to Live Production Site"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  if (env === 'dev') {
    return (
      <div className="bg-slate-700 text-slate-100 px-3 py-1 text-[11px] font-medium border-b border-slate-600 shadow-xs relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Terminal className="w-3.5 h-3.5 text-[#e8b4b8] shrink-0" />
            <span className="truncate">
              <strong className="text-white">DEV PREVIEW</strong> (Google AI Studio)
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono shrink-0">
            Sandbox
          </span>
        </div>
      </div>
    );
  }

  return null;
}
