'use client';

import Image from "next/image";
import { useGoogleLogin } from '@react-oauth/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


export default function Home() {

    const router = useRouter();


    const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api_dm/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({ code: codeResponse.code }),
          credentials: 'include'
        });

        if (res.ok) {
          window.location.href = '/dashboard'; 
        } else {
          const data = await res.json();
        }
      } catch (err) {
        console.error(err);
        // console.log(codeResponse)
      }
    },
    flow: 'auth-code',
    ux_mode: 'popup',
    scope: 'openid email profile',
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans p-6 selection:bg-emerald-100">
      <main className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Visual Header / Hero Section */}
        <div className="bg-slate-900 p-12 text-center sm:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4 relative z-10">
            MTA Subway Clock
          </h1>
          <p className="text-slate-400 text-lg max-w-md relative z-10">
            Bring the pulse of the city to your desk. Real-time arrival data for the world's most iconic transit system.
          </p>
        </div>

        <div className="p-8 sm:p-12 flex flex-col gap-10">
          
          {/* Features Section */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-6">
              Features
            </h2>
            <ul className="space-y-4">
              {[
                "Track your local station's real-time arrivals",
                "High-precision synchronized clock",
                "Custom brightness and night-mode scheduling",
                "Support for all NYC Subway lines and directions"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700">
                  <div className="mt-1 bg-emerald-100 rounded-full p-1">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Action Section */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => login()}
                className="flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 text-white font-bold transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-95"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.16 5.44-7.84 5.44-4.8 0-8.72-3.96-8.72-8.64s3.92-8.64 8.72-8.64c2.72 0 4.56 1.16 5.6 2.12l2.56-2.48C18.96 1.12 16.04 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.2 0 12-5.08 12-12.2 0-.84-.08-1.48-.2-2.12h-11.8z" />
                </svg>
                Sign in with Google
              </button>
              
              <Link
                href="/dashboard"
                className="flex h-14 flex-1 items-center justify-center rounded-2xl bg-slate-100 px-8 text-slate-700 font-bold border border-slate-200 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-95"
              >
                Go to Dashboard
              </Link>
            </div>
            <p className="text-center text-sm text-slate-500">
              New here? Sign in to register your device and start tracking.
            </p>
          </section>

          {/* Footer Disclaimer */}
          <footer className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs leading-relaxed italic">
                This web application is an independent project and is not affiliated with, endorsed by, or connected to the NYC Metropolitan Transportation Authority (MTA).
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}