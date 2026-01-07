import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, BarChart2, User, Bell, Rocket, Globe, Eye, EyeOff, Camera, Play, Clock, Award, ChevronLeft, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import '../../lib/i18n';
import React from 'react';

import { MagneticButton } from '../../components/MagneticButton';

const TiltCard = ({ children, className, ...props }: { children: React.ReactNode, className?: string } & React.ComponentProps<typeof motion.div>) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
      {...props}
    >
      <div style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

const ProfileView = () => {
   const [showPassword, setShowPassword] = useState(false);
   
   return (
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.95 }}
         transition={{ duration: 0.4 }}
         className="max-w-4xl mx-auto space-y-8"
      >
         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-[#2563EB] to-[#7C3AED] rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20">
               <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                     <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                     <p className="text-sm font-medium text-blue-100">Total Hours</p>
                     <h3 className="text-2xl font-bold">128.5 hrs</h3>
                  </div>
               </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                  <Award className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-sm font-medium text-slate-500">Badges Earned</p>
                  <h3 className="text-2xl font-bold text-slate-900">12</h3>
               </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-sm font-medium text-slate-500">Courses Completed</p>
                  <h3 className="text-2xl font-bold text-slate-900">4</h3>
               </div>
            </div>
         </div>

         {/* Profile Edit */}
         <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-[#2563EB]/10 to-[#7C3AED]/10 relative">
               <button className="absolute top-4 right-4 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full text-xs font-bold text-[#2563EB] hover:bg-white transition-all">
                  Change Cover
               </button>
            </div>
            <div className="px-8 pb-8">
               <div className="relative -mt-16 mb-8 flex items-end justify-between">
                  <div className="relative group">
                     <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
                     </div>
                     <button className="absolute bottom-2 right-2 p-2 bg-slate-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                        <Camera className="w-4 h-4" />
                     </button>
                  </div>
                  <div className="flex gap-3">
                     <button className="px-6 py-2 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                     <button className="px-6 py-2 rounded-full bg-[#2563EB] text-white font-bold hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-blue-500/25">Save Changes</button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Full Name</label>
                     <input type="text" defaultValue="Ahmed Osman" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Email Address</label>
                     <input type="email" defaultValue="ahmed@example.com" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <label className="text-sm font-bold text-slate-700">Password</label>
                     <div className="relative">
                        <input 
                           type={showPassword ? "text" : "password"} 
                           defaultValue="password123" 
                           className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" 
                        />
                        <button 
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2563EB] transition-colors"
                        >
                           {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </motion.div>
   );
};

const CoursePlayer = ({ onBack }: { onBack: () => void }) => {
   return (
      <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 1.1 }} // Scale up when exiting? Or maybe just fade out. Let's do opacity.
         transition={{ duration: 0.5, type: "spring", damping: 25, stiffness: 120 }}
         className="absolute inset-0 z-50 bg-[#0f172a] text-white overflow-hidden flex"
      >
         {/* Sidebar */}
         <div className="w-80 bg-[#1e293b] border-r border-slate-700 flex flex-col">
            <div className="h-20 flex items-center px-6 border-b border-slate-700">
               <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-bold">Back to Dashboard</span>
               </button>
            </div>
            <div className="p-6">
               <h2 className="text-xl font-bold mb-2">FullStack Mastery</h2>
               <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
                  <div className="w-[75%] h-full bg-[#2563EB]" />
               </div>
               
               <div className="space-y-4">
                  {[
                     { title: "Introduction to React", duration: "12:45", active: false, complete: true },
                     { title: "Components & Props", duration: "18:20", active: false, complete: true },
                     { title: "State Management", duration: "25:10", active: true, complete: false },
                     { title: "Hooks Deep Dive", duration: "30:00", active: false, complete: false },
                  ].map((lesson, i) => (
                     <div key={i} className={`p-4 rounded-xl cursor-pointer transition-all ${lesson.active ? 'bg-[#2563EB] shadow-lg shadow-blue-500/20' : 'hover:bg-slate-800'}`}>
                        <div className="flex justify-between items-center mb-1">
                           <h4 className={`text-sm font-bold ${lesson.active ? 'text-white' : 'text-slate-300'}`}>Lesson {i + 1}</h4>
                           {lesson.complete && <CheckCircle className="w-4 h-4 text-[#10B981]" />}
                           {lesson.active && <Play className="w-4 h-4 text-white fill-white" />}
                        </div>
                        <p className={`text-sm ${lesson.active ? 'text-blue-100' : 'text-slate-500'}`}>{lesson.title}</p>
                        <p className={`text-xs mt-2 ${lesson.active ? 'text-blue-200' : 'text-slate-600'}`}>{lesson.duration}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Main Player */}
         <div className="flex-1 flex flex-col relative bg-black">
             <div className="flex-1 flex items-center justify-center relative group">
                {/* Fake Video Player UI */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 z-10 pointer-events-none" />
                <button className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform z-20 shadow-2xl">
                   <Play className="w-10 h-10 fill-white ml-2" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                   <h1 className="text-3xl font-bold mb-2">State Management in 2024</h1>
                   <p className="text-slate-300">Section 3 • Lesson 3</p>
                </div>
             </div>
         </div>
      </motion.div>
   );
};

const AssignmentsView = () => (
   <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
   >
      <h2 className="text-2xl font-bold text-slate-800">Pending Assignments</h2>
      <div className="grid gap-4">
         {[
            { title: "React Component Lifecycle", due: "Tomorrow", subject: "Frontend Dev", status: "Pending" },
            { title: "Database Schema Design", due: "Sep 24", subject: "Backend Dev", status: "In Progress" },
            { title: "User Persona Research", due: "Sep 28", subject: "UI/UX Design", status: "Not Started" },
         ].map((task, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
               <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${i === 0 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                     <FileText className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="font-bold text-slate-800">{task.title}</h3>
                     <p className="text-sm text-slate-500">{task.subject}</p>
                  </div>
               </div>
               <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                     task.due === 'Tomorrow' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                     Due: {task.due}
                  </span>
               </div>
            </div>
         ))}
      </div>
   </motion.div>
);

const GradesView = () => (
   <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
   >
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-slate-800">Performance Overview</h2>
         <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2563EB]"></span>
            <span className="text-sm text-slate-500">Average Grade: A-</span>
         </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-end justify-between h-64 gap-4">
         {[65, 80, 45, 90, 75, 85, 95].map((h, i) => (
            <motion.div 
               key={i}
               initial={{ height: 0 }}
               animate={{ height: `${h}%` }}
               transition={{ duration: 0.8, delay: i * 0.1, type: "spring" }}
               className="w-full bg-gradient-to-t from-[#2563EB] to-[#7C3AED] rounded-t-xl opacity-80 hover:opacity-100 transition-opacity relative group"
            >
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h}%
               </div>
            </motion.div>
         ))}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4">Strongest Areas</h3>
            <div className="flex flex-wrap gap-2">
               {['React Hooks', 'CSS Grid', 'API Design'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">{tag}</span>
               ))}
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <h3 className="font-bold text-slate-700 mb-4">Needs Improvement</h3>
             <div className="flex flex-wrap gap-2">
                {['TypeScript Generics', 'Docker'].map(tag => (
                   <span key={tag} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold">{tag}</span>
                ))}
             </div>
         </div>
      </div>
   </motion.div>
);

export default function StudentDashboard() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('courses');
  const [viewMode, setViewMode] = useState<'dashboard' | 'player'>('dashboard');

  const toggleLanguage = () => {
    i18n.changeLanguage(isRTL ? 'en' : 'ar');
  };

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, x: 20 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    // Check if any course is 100% and trigger confetti
    const courses = [
       { progress: 75 },
       { progress: 45 },
       { progress: 100 }
    ];
    if (courses.some(c => c.progress === 100)) {
       setTimeout(() => {
         confetti({
           particleCount: 150,
           spread: 80,
           origin: { y: 0.6 },
           colors: ['#2563EB', '#7C3AED', '#10B981']
         });
       }, 1000);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return (
          <motion.div 
             key="courses"
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             exit="exit"
             className="max-w-6xl mx-auto space-y-8"
           >
              {/* Progress Section */}
              <section>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Your Progress</h2>
                    <button className="text-sm font-bold text-[#2563EB] hover:text-[#7C3AED] transition-colors">View All</button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                       { course: "Advanced React Patterns", progress: 75, icon: BookOpen, color: "text-[#2563EB]", bg: "bg-[#2563EB]/10" },
                       { course: "UI/UX Principles", progress: 45, icon: FileText, color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10" },
                       { course: "Database Architecture", progress: 100, icon: BarChart2, color: "text-[#10B981]", bg: "bg-[#10B981]/10" }
                    ].map((item, i) => (
                       <TiltCard 
                          key={i}
                          variants={itemVariants}
                          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group cursor-pointer"
                       >
                          <div onClick={() => setViewMode('player')}>
                          
                          <div className="flex justify-between items-start mb-6 relative">
                             <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-inner`}>
                                <item.icon className="w-7 h-7" />
                             </div>
                             <span className="text-3xl font-extrabold text-slate-900">{item.progress}%</span>
                          </div>
                          
                          <h3 className="font-bold text-lg mb-4 text-slate-800">{item.course}</h3>
                          
                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${item.progress}%` }}
                               transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.5 + (i * 0.2) }}
                               className="h-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                             />
                          </div>
                          
                             <div className="mt-4 flex justify-between text-xs font-bold text-slate-400">
                                <span>0%</span>
                                <span>100%</span>
                             </div>
                          </div>
                       </TiltCard>
                    ))}
                 </div>
              </section>

              {/* Learning Path */}
              <section>
                 <h2 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-wider">Recommended Path</h2>
                 <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#F59E0B]" />
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#F97316] flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                          <Rocket className="w-10 h-10 fill-white/20" />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Mastering FullStack Development</h3>
                          <p className="text-slate-500 max-w-xl">A comprehensive journey from frontend basics to backend mastery. Unlock 12 new badges and certified status.</p>
                       </div>
                       <MagneticButton onClick={() => setViewMode('player')} className="ml-auto px-8 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-[#2563EB] transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-95">
                          Continue Journey
                       </MagneticButton>
                    </div>
                 </div>
              </section>
           </motion.div>
        );
      case 'assignments':
        return <AssignmentsView key="assignments" />;
      case 'grades':
        return <GradesView key="grades" />;
      case 'profile':
         return <ProfileView key="profile" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`relative h-screen bg-[#F8FAFC] text-slate-900 font-main overflow-hidden ${isRTL ? 'font-arabic' : 'font-main'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <AnimatePresence mode="wait">
        {viewMode === 'dashboard' ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="flex h-full"
          >
              {/* Background */}
              <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-tr from-[#2563EB]/10 to-[#7C3AED]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#10B981]/10 to-[#F59E0B]/10 rounded-full blur-[100px]" />
              </div>

              {/* Sidebar */}
              <aside className={`w-64 glass-panel bg-white/70 backdrop-blur-md ${isRTL ? 'border-l' : 'border-r'} border-[#2563EB]/10 flex flex-col z-20 shadow-xl shadow-blue-900/5 transition-all duration-300`}>
                <div className={`h-24 flex items-center px-8 border-b border-[#2563EB]/10`}>
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Rocket className="w-5 h-5 fill-white/20" />
                     </div>
                     <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#7C3AED]">
                       ITQAN
                     </span>
                  </div>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2">
                  {[
                    { id: 'courses', icon: BookOpen, label: 'My Courses' },
                    { id: 'assignments', icon: FileText, label: 'Assignments' },
                    { id: 'grades', icon: BarChart2, label: 'Grades' },
                    { id: 'profile', icon: User, label: 'Profile' },
                  ].map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`relative w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 group overflow-hidden ${
                        activeTab === item.id 
                          ? 'text-[#2563EB] font-bold shadow-lg shadow-blue-500/10' 
                          : 'text-slate-500 hover:bg-white hover:text-[#2563EB] hover:shadow-md'
                      }`}
                    >
                      {activeTab === item.id && (
                         <motion.div 
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-[#2563EB]/10 to-[#7C3AED]/10"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                         />
                      )}
                      <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
                      <span className="text-sm relative z-10">{item.label}</span>
                    </button>
                  ))}
                </nav>

                <div className="p-4 border-t border-[#2563EB]/10">
                   <div className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/50 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] p-[2px] shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                         <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                         </div>
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors">Ahmed Osman</p>
                         <p className="text-xs text-slate-500">Student</p>
                      </div>
                   </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header */}
                <header className="h-24 flex items-center justify-between px-8 z-10">
                  <div>
                     <h1 className="text-2xl font-bold text-slate-900">Welcome Back, Ahmed! 👋</h1>
                     <p className="text-slate-500 text-sm">Let's continue learning today.</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <button 
                       onClick={toggleLanguage}
                       className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#7C3AED] hover:border-[#7C3AED]/30 hover:shadow-lg transition-all"
                     >
                        <Globe className="w-5 h-5" />
                     </button>
                     <button className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#F59E0B] hover:border-[#F59E0B]/30 hover:shadow-lg transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                     </button>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                   <AnimatePresence mode="wait">
                     {renderContent()}
                   </AnimatePresence>
                </div>
              </main>
          </motion.div>
        ) : (
          <CoursePlayer key="player" onBack={() => setViewMode('dashboard')} />
        )}
      </AnimatePresence>
    </div>
  )
}
