'use client';
import Image from "next/image";
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';




export default function Home() {

  const login = useGoogleLogin({
    onSuccess: codeResponse => {
      console.log(codeResponse)
      fetch("http://localhost:5231/api_dm/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(codeResponse),
        credentials: "include"
      });
    },
    flow: 'auth-code',
    scope: 'openid email profile'
  });


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, create an account.
          </h1>

        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="/dashboard"
          >
            Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
