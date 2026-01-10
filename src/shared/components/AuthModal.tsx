import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, GraduationCap, Shield, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MagneticButton } from '../../components/MagneticButton';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (authMode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: authData.email,
          password: authData.password,
          options: {
            data: {
              full_name: authData.name,
              role: 'STUDENT'
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Hardcoded Role: All new public signups are assigned STUDENT role
          const { error: dbError } = await supabase
            .from('users')
            .upsert({ 
              id: data.user.id,
              name: authData.name, 
              email: authData.email, 
              role: 'STUDENT',
              createdAt: new Date().toISOString()
            }, { onConflict: 'id' });
          
          if (dbError) {
             console.error('Database sync failed during signup:', dbError);
          }

          const userSession = {
            name: authData.name,
            email: authData.email,
            role: 'STUDENT',
            id: data.user.id
          };
          
          localStorage.setItem('itqan_user', JSON.stringify(userSession));

          confetti({
            particleCount: 200, spread: 100, origin: { y: 0.6 },
            colors: ['#2563EB', '#7C3AED', '#F59E0B']
          });
          
          onClose();
          navigate('/dashboard');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password,
        });

        if (signInError) {
           if (signInError.message.includes('Email not confirmed')) {
              throw new Error('Please confirm your email address to log in. Check your inbox!');
           }
           throw signInError;
        }

        if (data.user) {
          // Fetch additional profile info to determine role-based redirection
          const { data: profile } = await supabase
            .from('users')
            .select('role, name, profileImage, coverImage, createdAt')
            .eq('id', data.user.id)
            .single();

          const userData = {
            name: profile?.name || data.user.email?.split('@')[0],
            email: data.user.email,
            role: profile?.role || 'STUDENT',
            profileImage: profile?.profileImage,
            coverImage: profile?.coverImage,
            id: data.user.id
          };

          localStorage.setItem('itqan_user', JSON.stringify(userData));
          
          // Celebration for successful login
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#2563EB', '#7C3AED']
          });

          onClose();
          // Precise redirection based on database role
          navigate(userData.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#F8FAFC]/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/20">
                  <Rocket className="w-8 h-8 fill-white/20" />
               </div>
               <h2 className="text-2xl font-bold text-slate-900 mb-2">
                 {authMode === 'login' ? t('welcome_back') : t('create_account')}
               </h2>
               <p className="text-slate-500 font-medium">
                 {authMode === 'login' ? t('ready_adventure') : t('join_journey')}
               </p>
            </div>


            <form onSubmit={handleAuth} className="space-y-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 mb-2"
                >
                  {error}
                </motion.div>
              )}
               {authMode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                   <input 
                    type="text" 
                    required
                    value={authData.name}
                    onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-bold mb-4"
                    placeholder={t('full_name')}
                  />
                </motion.div>
               )}

              <input 
                type="email" 
                required
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-bold"
                placeholder={t('email')}
              />
              
              <div className="relative group">
                 <motion.input 
                   type={showPassword ? "text" : "password"}
                   required
                   value={authData.password}
                   onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                   className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-6 ${isRTL ? 'pl-12' : 'pr-12'} text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-bold group-hover:border-slate-200`}
                   placeholder={t('password')}
                   animate={{
                     borderColor: showPassword ? "rgba(124, 58, 237, 0.5)" : "",
                   }}
                   transition={{ duration: 0.2 }}
                 />
                 <motion.button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   whileTap={{ scale: 0.9 }}
                   className={`absolute ${isRTL ? 'left-5' : 'right-5'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#7C3AED] transition-all p-1`}
                 >
                    {/* Fixed Logic: Open eye = Visible, Slashed eye = Hidden */}
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                 </motion.button>
              </div>

              <MagneticButton 
                 className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-[#2563EB] active:scale-95 transition-all shadow-lg hover:shadow-blue-500/25 mt-4 flex items-center justify-center gap-2"
              >
                  {isLoading ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="relative">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <div className="absolute inset-0 w-5 h-5 border-2 border-[#2563EB]/40 border-b-[#2563EB] rounded-full animate-spin [animation-duration:0.6s]" />
                      </div>
                      <span className="tracking-widest uppercase text-xs font-black">Authenticating...</span>
                    </motion.div>
                  ) : (
                    <span className="flex items-center gap-2">
                       {authMode === 'login' ? t('sign_in') : t('sign_up')}
                       <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                  )}
              </MagneticButton>
            </form>

            <div className="mt-6 text-center">
               <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-sm font-bold text-slate-500 hover:text-[#2563EB] transition-colors"
               >
                  {authMode === 'login' ? t('switch_to_signup') : t('switch_to_login')}
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
