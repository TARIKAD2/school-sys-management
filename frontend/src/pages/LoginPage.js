import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { User, Lock, GraduationCap, Landmark } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(form);
      if (user?.role === "admin") navigate("/admin/dashboard", { replace: true });
      if (user?.role === "teacher") navigate("/teacher/dashboard", { replace: true });
      if (user?.role === "student") navigate("/student/dashboard", { replace: true });
      if (user?.role === "secretary") navigate("/secretary/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-r from-[#035bd8] via-[#0974e1] to-[#1facf4]">
      {/* Outer Decorative Vectors mapping the screenshot */}
      <div className="absolute bottom-0 left-[8%] w-[120px] h-[180px] bg-[#3fe8b4] rounded-t-full mix-blend-overlay opacity-30 filter blur-3xl" />
      <div className="absolute bottom-[-50px] left-[15%]">
         {/* Green accent triangle mimic */}
         <svg width="100" height="150" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M50 0L100 80H0L50 0Z" fill="#20e6a8" opacity="0.8" />
             <rect x="40" y="80" width="20" height="70" fill="#20e6a8" opacity="0.8" />
         </svg>
      </div>

      {/* Main Split Card Box */}
      <div className="w-[90%] max-w-[1100px] bg-white rounded-[4px] shadow-2xl flex overflow-hidden min-h-[580px] z-10 mx-auto">
        
        {/* Left Side (White Form Box) */}
        <div className="w-full md:w-[40%] bg-white p-10 flex flex-col items-center justify-between relative">
          
          <div className="w-full">
            {/* Logo Heading */}
            <div className="w-full flex justify-start items-center gap-2 mb-10 text-slate-800 opacity-80">
              <Landmark size={20} className="text-[#a68a52]" />
              <span className="font-bold tracking-tight text-[12px] uppercase">Bright Future Academy</span>
            </div>

            {/* Center Avatar & Title */}
            <div className="flex flex-col items-center mt-6 mb-12">
              <div className="w-[75px] h-[75px] bg-[#1a85fe] rounded-full flex items-center justify-center mb-5 shadow-[0_5px_15px_rgba(26,133,254,0.3)] relative">
                 <User size={30} className="text-white mt-2" strokeWidth={2.5} />
                 <GraduationCap size={44} className="absolute -top-4 text-[#061834]" fill="#152744" strokeWidth={1} />
              </div>
              <h2 className="text-[13px] uppercase tracking-[0.15em] font-bold text-slate-700">
                Graduate Service
              </h2>
            </div>

            {error && <div className="text-red-500 text-xs mb-3 text-center">{error}</div>}

            {/* Form */}
            <form className="w-full max-w-[280px] mx-auto flex flex-col gap-4" onSubmit={onSubmit}>
              
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={15} className="text-gray-300" strokeWidth={2.5} />
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="Email Address" 
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full py-3.5 pl-[2.6rem] pr-4 border border-gray-100 rounded-[5px] text-[12px] font-semibold placeholder:text-gray-300 focus:outline-none focus:border-[#1a85fe] focus:ring-1 focus:ring-[#1a85fe] transition-all bg-white"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={15} className="text-gray-300" strokeWidth={2.5} />
                </div>
                <input 
                  type="password"
                  required 
                  placeholder="Password" 
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full py-3.5 pl-[2.6rem] pr-4 border border-gray-100 rounded-[5px] text-[12px] font-semibold placeholder:text-gray-300 focus:outline-none focus:border-[#1a85fe] focus:ring-1 focus:ring-[#1a85fe] transition-all bg-white"
                />
              </div>

              {/* Bottom Row / Login Action */}
              <div className="flex items-center justify-between mt-5">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-[#1a85fe] hover:bg-blue-600 active:scale-95 text-white font-semibold py-2.5 px-8 rounded-full shadow-[0_5px_15px_rgba(26,133,254,0.3)] transition-all text-[13px]"
                >
                  {submitting ? "..." : "Login"}
                </button>
                <a href="#reset" onClick={(e) => e.preventDefault()} className="text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors">
                  Forget Password?
                </a>
              </div>

            </form>
          </div>
          
          <div className="w-full flex justify-center mt-10">
             {/* Tiny standing figure vector mimic (optional decor) */}
             <div className="w-full flex justify-between px-8 text-gray-200">
                <User size={16} />
             </div>
          </div>
        </div>

        {/* Right Side (Illustration Box) */}
        <div className="hidden md:flex md:w-[60%] bg-[#f2f8fe] relative items-center justify-center overflow-hidden border-l border-gray-50">
           {/* Fallback pattern if image is missing, but prioritizing the high-res artifact */}
           <img 
             src="/isometric_login_bg.png" 
             alt="University Isometric Graphic" 
             className="absolute w-full h-full object-cover mix-blend-multiply opacity-100"
             onError={(e) => {
               // Fallback to high-quality unsplash gradient if Local copy failed
               e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop";
               e.target.className = "absolute w-full h-full object-cover opacity-60 mix-blend-multiply";
             }}
           />
           {/* Tiny decorative floating dots matching mockup */}
           <div className="absolute top-10 right-20 w-1.5 h-1.5 bg-[#179a52] rounded-full"></div>
           <div className="absolute bottom-10 right-10 flex gap-1 border border-blue-200 p-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-blue-200 rounded-full"></div>
           </div>
        </div>
        
      </div>
    </div>
  );
}
