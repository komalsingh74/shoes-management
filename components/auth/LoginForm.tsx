"use client";

import { useState, FormEvent } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  Package,
  ShoppingCart,
  BarChart3,
  Boxes,
} from "lucide-react";
import Link from "next/link";

/* ----------------------------------------------------------------
   Brand shoe icon (custom SVG — no emoji, feels more premium)
----------------------------------------------------------------- */
function ShoeMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 20.5c0-1.2.5-2.3 1.4-3.1l5.9-5.2c.6-.5 1.5-.6 2.2-.2l3.4 1.9c.6.3 1.3.3 1.9 0l5.6-3c.5-.3 1.1-.3 1.6 0l4.6 2.6c1.1.6 1.8 1.8 1.8 3.1v1.6c0 .8-.7 1.5-1.5 1.5H4.5c-.8 0-1.5-.7-1.5-1.5v-1.7Z"
        fill="currentColor"
      />
      <path
        d="M3 23.8h26c0 1-.8 1.8-1.8 1.8H4.8C3.8 25.6 3 24.8 3 23.8Z"
        fill="currentColor"
        opacity="0.55"
      />
      <circle cx="9" cy="19" r="1" fill="#fff" opacity="0.9" />
      <circle cx="13" cy="19" r="1" fill="#fff" opacity="0.9" />
    </svg>
  );
}

/* ----------------------------------------------------------------
   Feature list for the branding panel
----------------------------------------------------------------- */
const features = [
  { icon: Boxes, label: "Inventory tracking" },
  { icon: ShoppingCart, label: "Order management" },
  { icon: Package, label: "Product catalog" },
  { icon: BarChart3, label: "Sales analytics" },
];

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // TODO: wire up real auth
    // await loginUser({ email, password, remember });

    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex items-stretch justify-center">
      {/* ============================= LEFT: BRAND PANEL ============================= */}
      <aside className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative overflow-hidden bg-[#0b0b0d] text-white">
        {/* Ambient gradient blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#0b0b0d] flex items-center justify-center shadow-lg">
              <ShoeMark className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Shoe<span className="text-indigo-400">Flow</span>
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-md">
            <h2 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
              Run your footwear
              <br />
              business{" "}
              <span className="text-indigo-400">effortlessly.</span>
            </h2>
            <p className="mt-5 text-gray-400 text-[15px] leading-relaxed">
              The all-in-one platform to manage inventory, orders, products and
              sales — built for modern shoe retailers.
            </p>

            {/* Feature chips */}
            <ul className="mt-10 grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3"
                >
                  <Icon size={18} className="text-indigo-400 shrink-0" />
                  <span className="text-[13px] font-medium text-gray-200">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ShoeFlow. Crafted for shoe sellers.
          </p>
        </div>
      </aside>

      {/* ============================= RIGHT: FORM PANEL ============================= */}
      <main className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10">
        <div className="w-full max-w-[440px]">
          {/* Mobile brand (shown only on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0b0b0d] text-white shadow-lg mb-4">
              <ShoeMark className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Shoe<span className="text-indigo-600">Flow</span>
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your footwear business smarter.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/60 p-7 sm:p-10">
            <div className="mb-8">
              <h2 className="text-[26px] font-semibold text-gray-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-gray-500 mt-1.5">
                Sign in to continue to your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <div className="relative group">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-12 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember + dashboard link */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <label
                  htmlFor="remember"
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>

                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Go to Dashboard →
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full h-12 rounded-xl bg-gray-900 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 hover:bg-indigo-600 hover:shadow-indigo-600/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                  Secure business access
                </span>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400">
              © {new Date().getFullYear()} ShoeFlow. All rights reserved.
            </p>
          </div>

          {/* Bottom tagline */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Inventory • Orders • Products • Sales
          </p>
        </div>
      </main>
    </div>
  );
}