import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "brand": "ITQAN",
      "courses": "Courses",
      "mentors": "Mentors",
      "community": "Community",
      "get_started": "Get Started",
      "hero_badge": "🚀 Multi-Generational Learning",
      "hero_title_1": "Learning That Feels",
      "hero_title_2": "Alive & Limitless",
      "hero_desc": "Join a vibrant community of learners from ages 8 to 80. Master coding, arts, and sciences in an environment designed for growth.",
      "start_learning": "Start Learning Free",
      "watch_demo": "Watch Demo",
      "explore_passion": "Explore Your Passion",
      "passion_sub": "Coding • Arts • Science",
      "why_choose": "Why Choose ITQAN?",
      "why_desc": "Platform designed to be as versatile as you are.",
      "feat_fun": "Fun & Engaging",
      "feat_fun_desc": "Gamified lessons that keep you hooked from day one.",
      "feat_comm": "Community First",
      "feat_comm_desc": "Learn together with peers from around the globe.",
      "feat_expert": "Expert Led",
      "feat_expert_desc": "Curriculum designed by industry veterans and educators.",
      "welcome_back": "Welcome Back!",
      "ready_adventure": "Ready to continue your adventure?",
      "create_account": "Create Account",
      "join_journey": "Join the journey today!",
      "email": "Email Address",
      "password": "Password",
      "full_name": "Full Name",
      "sign_in": "Let's Go! 🚀",
      "sign_up": "Create Account ✨",
      "student": "Student",
      "admin": "Admin",
      "admin_access": "Admin Portal Access",
      "switch_to_signup": "New here? Create an account",
      "switch_to_login": "Already have an account? Login",
    }
  },
  ar: {
    translation: {
      "brand": "إتقان",
      "courses": "الدورات",
      "mentors": "الموجهين",
      "community": "المجتمع",
      "get_started": "ابدأ الآن",
      "hero_badge": "🚀 تعلم متعدد الأجيال",
      "hero_title_1": "تعلم ينبض",
      "hero_title_2": "بالحياة وبلا حدود",
      "hero_desc": "انضم إلى مجتمع نابض بالحياة من المتعلمين من جميع الأعمار. أتقن البرمجة والفنون والعلوم في بيئة مصممة للنمو.",
      "start_learning": "ابدأ التعلم مجانًا",
      "watch_demo": "شاهد العرض",
      "explore_passion": "اكتشف شغفك",
      "passion_sub": "برمجة • فنون • علوم",
      "why_choose": "لماذا تختار إتقان؟",
      "why_desc": "منصة مصممة لتكون متنوعة مثلك تمامًا.",
      "feat_fun": "ممتع وتفاعلي",
      "feat_fun_desc": "دروس محفزة تبقيك متشوقًا من اليوم الأول.",
      "feat_comm": "المجتمع أولاً",
      "feat_comm_desc": "تعلم مع أقرانك من جميع أنحاء العالم.",
      "feat_expert": "بقيادة خبراء",
      "feat_expert_desc": "مناهج مصممة من قبل رواد الصناعة والمعلمين.",
      "welcome_back": "مرحبًا بعودتك!",
      "ready_adventure": "جاهز لمواصلة مغامرتك؟",
      "create_account": "إنشاء حساب",
      "join_journey": "انضم إلى الرحلة اليوم!",
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "full_name": "الاسم الكامل",
      "sign_in": "ينطلق! 🚀",
      "sign_up": "إنشاء حساب ✨",
      "student": "طالب",
      "admin": "مشرف",
      "admin_access": "بوابة المشرفين",
      "switch_to_signup": "جديد هنا؟ أنشئ حسابًا",
      "switch_to_login": "لديك حساب بالفعل؟ سجل الدخول",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
