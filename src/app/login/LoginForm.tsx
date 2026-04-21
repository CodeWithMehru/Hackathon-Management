"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Panda Refs & State
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const eyeL = document.querySelector('.eyeball-l') as HTMLElement;
    const eyeR = document.querySelector('.eyeball-r') as HTMLElement;
    const handL = document.querySelector('.hand-l') as HTMLElement;
    const handR = document.querySelector('.hand-r') as HTMLElement;

    if (!eyeL || !eyeR || !handL || !handR) return;

    const normalEyeStyle = () => {
      eyeL.style.cssText = `left:0.6em;top:0.6em;`;
      eyeR.style.cssText = `right:0.6em;top:0.6em;`;
    };

    const normalHandStyle = () => {
      handL.style.cssText = `height: 2.81em;top:8.4em;left:7.5em;transform: rotate(0deg);`;
      handR.style.cssText = `height: 2.81em;top:8.4em;right:7.5em;transform: rotate(0deg);`;
    };

    const onFocusUsername = () => {
      eyeL.style.cssText = `left:0.75em;top:1.12em;`;
      eyeR.style.cssText = `right:0.75em;top:1.12em;`;
      normalHandStyle();
    };

    const onFocusPassword = () => {
      handL.style.cssText = `height:6.56em;top:3.87em;left:11.75em;transform:rotate(-155deg);`;
      handR.style.cssText = `height:6.56em;top:3.87em;right:11.75em;transform:rotate(155deg);`;
      normalEyeStyle();
    };

    const onClickOutside = (e: MouseEvent) => {
      if (e.target !== emailRef.current && e.target !== passwordRef.current && !(e.target as Element).closest('.toggle-password')) {
        normalEyeStyle();
        normalHandStyle();
      }
    };

    emailRef.current?.addEventListener('focus', onFocusUsername);
    passwordRef.current?.addEventListener('focus', onFocusPassword);
    document.addEventListener('click', onClickOutside);

    return () => {
      emailRef.current?.removeEventListener('focus', onFocusUsername);
      passwordRef.current?.removeEventListener('focus', onFocusPassword);
      document.removeEventListener('click', onClickOutside);
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page-wrapper min-h-screen">
      
      {/* Dynamic Scoped CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;800&family=Barlow+Condensed:wght@700&display=swap');
        
        .login-page-wrapper {
          font-family: "Nunito", sans-serif;
          background-color: #194685;
          min-height: 100vh;
          width: 100vw;
          position: relative;
          overflow-x: hidden;
        }

        /* Header Styling */
        .hackdesk-header-bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 4rem;
          background-color: #15386b; /* Slightly darker brand blue */
          z-index: 998;
          display: flex;
          align-items: center;
          padding-left: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        }

        .hackdesk-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2.2rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 1px;
          margin: 0;
        }

        /* Form Container */
        .container {
          height: 33em;
          width: 32em;
          position: absolute;
          transform: translate(-50%, -50%);
          top: 50%;
          left: 50%;
        }

        .panda-form {
          width: 24em;
          height: 20em; /* Reduced height since we removed forgot/signup links */
          background-color: #ffffff;
          position: absolute;
          transform: translate(-50%, -50%);
          top: calc(50% + 4em);
          left: 50%;
          padding: 2.5em 3em 3em 3em;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-radius: 0.75em;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          z-index: 10;
        }

        .panda-form label {
          display: block;
          margin-bottom: 0.8em;
          font-weight: 600;
          color: #34495e;
          font-size: 1rem;
        }

        .panda-form label[for="password"] {
          margin-top: 1em;
        }

        .panda-form input {
          font-size: 1rem;
          font-weight: 400;
          color: #34495e;
          padding: 0.4em 0.2em;
          border: none;
          border-bottom: 0.15em solid #34495e;
          outline: none;
          background-color: transparent !important;
          width: 100%;
          transition: border-color 0.3s ease-in-out;
        }

        .panda-form input::placeholder {
          color: #7f8c8d;
        }

        .panda-form input:focus {
          border-bottom: 0.15em solid transparent;
          background-image: linear-gradient(to right, #1d4ed8, #3b82f6);
          background-position: 0 100%;
          background-size: 100% 2px;
          background-repeat: no-repeat;
        }

        .panda-form button {
          font-size: 1em;
          padding: 0.9em 0;
          border-radius: 2em;
          background-color: #1d4ed8;
          color: white;
          font-weight: 600;
          margin-top: 2em;
          cursor: pointer;
          border: none;
          outline: none;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: opacity 0.3s ease-in-out, background-color 0.3s;
        }

        .panda-form button:hover {
          background-color: #1e40af;
        }

        .panda-form button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Password wrapper */
        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .toggle-password {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.2em;
          cursor: pointer;
          user-select: none;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.85em;
          margin-top: 1em;
          text-align: center;
        }

        /* Panda Parts */
        .panda-face {
          height: 8em; width: 9em; background: #fff;
          border: 0.2em solid #1A1A1A; border-radius: 8em 8em 5.5em 5.5em;
          position: absolute; top: 2.5em; left: 0; right: 0; margin: auto;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4); z-index: 5;
        }
        .ear-l, .ear-r {
          background: #1A1A1A; height: 2.8em; width: 3em;
          border-radius: 2.8em 2.8em 0 0; position: absolute; top: 1.8em; z-index: 1;
        }
        .ear-l { left: 11em; transform: rotate(-38deg); }
        .ear-r { right: 11em; transform: rotate(38deg); }
        
        .blush-l, .blush-r {
          background: #fab1a0; height: 1.2em; width: 1.5em;
          border-radius: 50%; position: absolute; top: 4.5em;
        }
        .blush-l { left: 1.2em; transform: rotate(25deg); }
        .blush-r { right: 1.2em; transform: rotate(-25deg); }
        
        .eye-l, .eye-r {
          background: #1A1A1A; height: 2.3em; width: 2.2em;
          border-radius: 50%; position: absolute; top: 2.5em;
        }
        .eye-l { left: 1.5em; transform: rotate(-20deg); }
        .eye-r { right: 1.5em; transform: rotate(20deg); }
        
        .eyeball-l, .eyeball-r {
          height: 0.7em; width: 0.7em; background: #fff;
          border-radius: 50%; position: absolute; left: 0.6em; top: 0.6em;
          animation: blink 5s infinite ease-in-out;
        }
        
        @keyframes blink {
          0%, 97%, 100% { height: 0.7em; }
          98%, 99% { height: 0; }
        }
        
        .nose {
          height: 1.2em; width: 1.2em; background: #1A1A1A;
          position: absolute; top: 5em; left: 0; right: 0; margin: auto;
          transform: rotate(45deg); border-radius: 1.5em 0 0 0.25em;
        }
        .nose:before {
          content: ""; position: absolute; background: #1A1A1A;
          height: 0.6em; width: 0.1em; top: 0.85em; left: 1.2em; transform: rotate(-45deg);
        }
        
        .mouth {
          top: 5.7em; left: 3.3em; height: 0.8em; width: 0.95em;
          border-radius: 50%; box-shadow: 0 0.2em #1A1A1A; position: absolute;
        }
        .mouth:before {
          content: ""; position: absolute; left: 0.9em; height: 0.8em; width: 0.95em;
          border-radius: 50%; box-shadow: 0 0.2em #1A1A1A;
        }
        
        .hand-l, .hand-r {
          background: #1A1A1A; height: 2.81em; width: 2.6em;
          position: absolute; border-radius: 0.7em 0.7em 2.3em 2.3em; top: 8.4em; z-index: 15;
          transition: transform 0.3s ease, left 0.3s ease, right 0.3s ease, height 0.3s ease, top 0.3s ease;
        }
        .hand-l { left: 8.1em; }
        .hand-r { right: 8.1em; }
        
        .paw-l, .paw-r {
          background: #1A1A1A; height: 3.5em; width: 3.5em;
          border-radius: 2.8em 2.8em 1.5em 1.5em; position: absolute; top: 30em; z-index: 15;
        }
        .paw-l { left: 9.8em; }
        .paw-r { right: 9.8em; }
        .paw-l:before, .paw-r:before {
          content: ""; background: #fff; height: 1.5em; width: 1.8em;
          position: absolute; top: 1.2em; left: 0.6em; border-radius: 1.6em 1.6em 0.7em 0.7em;
        }
        .paw-l:after, .paw-r:after {
          content: ""; background: #fff; height: 0.7em; width: 0.7em;
          position: absolute; top: 0.8em; left: 1.4em; border-radius: 50%;
          box-shadow: 0.85em 0 0 #fff, -0.85em 0 0 #fff;
        }
      `}} />

      {/* Header Bar */}
      <div className="hackdesk-header-bar">
        <h1 className="hackdesk-title">Hack Desk</h1>
      </div>

      <div className="container">
        {/* Panda Parts */}
        <div className="ear-l"></div>
        <div className="ear-r"></div>
        <div className="panda-face">
          <div className="blush-l"></div>
          <div className="blush-r"></div>
          <div className="eye-l"><div className="eyeball-l"></div></div>
          <div className="eye-r"><div className="eyeball-r"></div></div>
          <div className="nose"></div>
          <div className="mouth"></div>
        </div>
        <div className="hand-l"></div>
        <div className="hand-r"></div>
        <div className="paw-l"></div>
        <div className="paw-r"></div>

        {/* Login Form */}
        <form className="panda-form" onSubmit={onSubmit}>
          <label htmlFor="email">Email:</label>
          <input
            ref={emailRef}
            type="email"
            id="email"
            placeholder="organizer@event.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password:</label>
          <div className="password-wrapper">
            <input
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}