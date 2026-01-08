import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Sparkles, BookOpen, Users, Rocket, Globe, Menu, ChevronRight, PlayCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import '../../lib/i18n';

// Magnetic Button Component
import { MagneticButton } from '../../components/MagneticButton';
import { AuthModal } from '../../shared/components/AuthModal';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  const toggleLanguage = () => {
    i18n.changeLanguage(isRTL ? 'en' : 'ar');
  };

  // handleAuth removed, moved to AuthModal

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
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
              onClick={() => {
                setAuthMode('signup');
                setIsLoginModalOpen(true);
              }}
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
                onClick={() => {
                  setAuthMode('signup');
                  setIsLoginModalOpen(true);
                }}
                className="group relative px-9 py-4 rounded-full bg-slate-900 text-white font-bold text-lg hover:-translate-y-1 hover:shadow-2xl shadow-slate-900/30 active:scale-95 transition-all duration-300 w-full sm:w-auto overflow-hidden ring-4 ring-transparent hover:ring-blue-500/20"
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

      <AuthModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        initialMode={authMode} 
      />
    </div>
  );
}
