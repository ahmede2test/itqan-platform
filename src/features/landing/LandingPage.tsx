import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Users, Rocket, Globe, Menu, X, ChevronRight, PlayCircle, Shield, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import '../../lib/i18n';

// Magnetic Button Component
import { MagneticButton } from '../../components/MagneticButton';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(isRTL ? 'en' : 'ar');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      if (authMode === 'signup') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#7C3AED', '#F59E0B']
        });
      }

      if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    }, 1500);
  };

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div 
      className={`min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#2563EB] selection:text-white ${isRTL ? 'font-arabic' : 'font-main'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-tr from-[#2563EB]/20 to-[#7C3AED]/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#10B981]/20 to-[#F59E0B]/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-white/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Rocket className="w-6 h-6 fill-white/20" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-1">
              {t('brand')}
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="font-medium text-slate-600 hover:text-[#2563EB] transition-colors">{t('courses')}</a>
            <a href="#" className="font-medium text-slate-600 hover:text-[#2563EB] transition-colors">{t('mentors')}</a>
            <a href="#" className="font-medium text-slate-600 hover:text-[#2563EB] transition-colors">{t('community')}</a>
            
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 font-bold text-slate-700 hover:text-[#7C3AED] transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{isRTL ? 'English' : 'العربية'}</span>
            </button>

            <MagneticButton 
              onClick={() => { setIsLoginModalOpen(true); setAuthMode('login'); }}
              className="px-6 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-200"
            >
              {t('get_started')}
            </MagneticButton>
          </div>

          <button className="md:hidden p-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-col md:flex-row items-center gap-12"
        >
          <div className="flex-1 text-center md:text-start z-10">
            <motion.div variants={fadeInUp}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-sm mb-6 border border-[#2563EB]/20">
                {t('hero_badge')}
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-[1.15]">
              {t('hero_title_1')} <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#F59E0B]">
                {t('hero_title_2')}
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-lg mx-auto md:mx-0">
              {t('hero_desc')}
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <MagneticButton 
                onClick={() => { setIsLoginModalOpen(true); setAuthMode('signup'); }}
                className="group relative px-8 py-4 rounded-full bg-slate-900 text-white font-bold text-lg hover:-translate-y-1 hover:shadow-xl shadow-slate-900/20 active:scale-95 transition-all duration-300 w-full sm:w-auto overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {t('start_learning')} 
                  {isRTL ? <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </span>
              </MagneticButton>
              
              <button className="px-8 py-4 rounded-full bg-white text-slate-700 font-bold border-2 border-slate-100 hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5 active:scale-95 transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center">
                <PlayCircle className="w-5 h-5 text-[#2563EB]" />
                {t('watch_demo')}
              </button>
            </motion.div>
          </div>

          {/* Hero Visual */}
          <motion.div variants={fadeInUp} className="flex-1 relative w-full max-w-lg">
            <div className="relative aspect-square rounded-[3rem] bg-white shadow-2xl overflow-hidden border-4 border-white/50">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 to-[#7C3AED]/5" />
              
              {/* Physics Floating Elements Animation */}
              {[1, 2, 3].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [-15, 15, -15] }}
                  transition={{ 
                    duration: 4 + i, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className={`absolute cursor-pointer ${i===0 ? 'top-10 left-10' : i===1 ? 'top-1/2 right-10' : 'bottom-10 left-20'}`}
                >
                   <div className="p-4 rounded-2xl bg-white shadow-xl border border-slate-100 backdrop-blur transform hover:shadow-2xl transition-all">
                     {i === 0 && <span className="text-4xl">🎨</span>}
                     {i === 1 && <span className="text-4xl">💻</span>}
                     {i === 2 && <span className="text-4xl">🔬</span>}
                   </div>
                </motion.div>
              ))}

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center p-8">
                   <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#7C3AED] mb-2">{t('explore_passion')}</h3>
                   <p className="text-slate-500 font-medium">{t('passion_sub')}</p>
                </div>
              </div>
            </div>
            
            {/* Soft Glow behind visual */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2563EB] to-[#F59E0B] rounded-full blur-[80px] opacity-20 -z-10" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{t('why_choose')}</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t('why_desc')}</p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Sparkles, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", title: "feat_fun", desc: "feat_fun_desc" },
              { icon: Users, color: "text-[#2563EB]", bg: "bg-[#2563EB]/10", title: "feat_comm", desc: "feat_comm_desc" },
              { icon: BookOpen, color: "text-[#10B981]", bg: "bg-[#10B981]/10", title: "feat_expert", desc: "feat_expert_desc" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-[#2563EB]/10 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{t(feature.title)}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{t(feature.desc)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200/60 bg-white/60">
         <div className="max-w-7xl mx-auto text-center">
            <p className="text-slate-500 font-medium">© 2026 ITQAN Platform. Making learning alive.</p>
         </div>
      </footer>

      {/* Auth Modal with Role Switcher */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-[#F8FAFC]/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100"
            >
              <button 
                onClick={() => setIsLoginModalOpen(false)}
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

              {/* Role Switcher */}
              <div className="bg-slate-100 p-1 rounded-xl flex mb-6 relative overflow-hidden">
                <motion.div 
                   className="absolute inset-y-1 bg-white rounded-lg shadow-sm w-1/2"
                   initial={false}
                   animate={{ 
                     x: userRole === 'student' ? (isRTL ? '100%' : '0%') : (isRTL ? '0%' : '100%'),
                   }}
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button 
                   onClick={() => setUserRole('student')}
                   className={`flex-1 relative z-10 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${userRole === 'student' ? 'text-slate-900' : 'text-slate-500'}`}
                >
                   <GraduationCap className="w-4 h-4" /> {t('student')}
                </button>
                <button 
                   onClick={() => setUserRole('admin')}
                   className={`flex-1 relative z-10 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${userRole === 'admin' ? 'text-slate-900' : 'text-slate-500'}`}
                >
                   <Shield className="w-4 h-4" /> {t('admin')}
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                     <input 
                      type="text" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-bold"
                      placeholder={t('full_name')}
                    />
                  </motion.div>
                )}
                
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-bold"
                  placeholder={t('email')}
                />
                
                <div className="relative group">
                   <motion.input 
                     type={showPassword ? "text" : "password"}
                     className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-6 pr-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-bold"
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
                     className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#7C3AED] transition-all p-1"
                   >
                       <AnimatePresence mode="wait" initial={false}>
                           <motion.div
                               key={showPassword ? 'hide' : 'show'}
                               initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
                               animate={{ opacity: 1, rotate: 0, scale: 1 }}
                               exit={{ opacity: 0, rotate: 20, scale: 0.8 }}
                               transition={{ duration: 0.2 }}
                           >
                               {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                           </motion.div>
                       </AnimatePresence>
                   </motion.button>
                </div>

                <MagneticButton 
                   className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-[#2563EB] active:scale-95 transition-all shadow-lg hover:shadow-blue-500/25 mt-4 flex items-center justify-center gap-2"
                >
                   {isLoading ? (
                     <div className="flex items-center gap-2">
                       <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Processing...
                     </div>
                   ) : (
                     authMode === 'login' ? t('sign_in') : t('sign_up')
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
    </div>
  );
}
