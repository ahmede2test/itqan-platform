import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, ArrowRight } from 'lucide-react';

type AuthRole = 'student' | 'admin';

export default function AuthPage() {
  const [role, setRole] = useState<AuthRole>('student');
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-[hsl(222,47%,8%)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#d4af37] opacity-[0.02] blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        layout
        className="w-full max-w-md relative z-10"
      >
        {/* Role Switcher */}
        <div className="glass-panel p-1 rounded-full flex mb-8 mx-auto w-fit">
          <button
            onClick={() => setRole('student')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              role === 'student' ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Student
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              role === 'admin' ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" /> Admin
          </button>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-20" />
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 font-arabic">
              {isLogin ? 'Welcome Back' : 'Join Itqan'}
            </h2>
            <p className="text-sm text-gray-400">
              {role === 'student' ? 'Access your learning journey' : 'Manage the platform'}
            </p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Email</label>
              <input 
                type="email" 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all placeholder:text-gray-700"
                placeholder="name@example.com"
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Password</label>
              <input 
                type="password" 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all placeholder:text-gray-700"
                placeholder="••••••••"
              />
            </div>

            <button className="w-full bg-[#d4af37] text-black font-bold py-3 rounded-xl hover:bg-[#b5952f] transition-all transform active:scale-95 shadow-[0_4px_20px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2 mt-6">
              {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-gray-400 hover:text-[#d4af37] transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
