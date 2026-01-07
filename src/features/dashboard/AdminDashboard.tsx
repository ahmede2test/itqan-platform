import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Users, BookOpen, Settings, Bell, Search, Upload, Plus, MoreVertical, Globe, Trash2, Edit2, Rocket, CheckCircle, Video, Image as ImageIcon, Layout, X, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { addNotification } from '../../lib/notifications';

const StatCard = ({ label, value, change, color }: { label: string, value: string, change: string, color: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group`}
  >
     <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`} />
     <h3 className="text-slate-500 font-medium mb-2 relative z-10">{label}</h3>
     <div className="text-3xl font-bold text-slate-900 mb-2 relative z-10">{value}</div>
     <div className="flex items-center gap-2 text-sm font-bold text-green-600 relative z-10">
        <span className="bg-green-100 px-2 py-1 rounded-lg">{change}</span>
        <span className="text-slate-400 font-normal">vs last month</span>
     </div>
  </motion.div>
);

const GrowthChart = ({ isRTL }: { isRTL: boolean }) => {
   // Simulated data points for a smooth curve
   const data = [10, 25, 18, 30, 45, 35, 55, 48, 65, 58, 75, 90];
   const width = 1000;
   const height = 300;
   
   // Simple logic to create path commands
   const createPath = (data: number[]) => {
      const step = width / (data.length - 1);
      const points = data.map((d, i) => {
         const x = i * step;
         const y = height - (d / 100) * height; // Normalize to height
         return `${x},${y}`;
      });
      return `M ${points.join(' L ')}`;
   };

   // Area path (closed at bottom)
   const createArea = (data: number[]) => {
      return `${createPath(data)} L ${width},${height} L 0,${height} Z`;
   };

   return (
      <div className={`w-full h-full relative ${isRTL ? 'scale-x-[-1]' : ''}`}>
         <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
               <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
               </linearGradient>
            </defs>
            
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map((tick, i) => (
               <line 
                  key={i}
                  x1="0" 
                  y1={height - (tick / 100) * height} 
                  x2={width} 
                  y2={height - (tick / 100) * height} 
                  stroke="#E2E8F0" 
                  strokeDasharray="4 4" 
               />
            ))}

            {/* Area */}
            <motion.path 
               d={createArea(data)} 
               fill="url(#chartGradient)" 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1 }}
            />

            {/* Line */}
            <motion.path 
               d={createPath(data)} 
               fill="none" 
               stroke="#2563EB" 
               strokeWidth="4" 
               strokeLinecap="round" 
               strokeLinejoin="round" 
               initial={{ pathLength: 0 }}
               animate={{ pathLength: 1 }}
               transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Points */}
            {data.map((d, i) => (
               <motion.circle 
                  key={i}
                  cx={i * (width / (data.length - 1))}
                  cy={height - (d / 100) * height}
                  r="6"
                  fill="white"
                  stroke="#2563EB"
                  strokeWidth="3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5 + (i * 0.1) }}
                  whileHover={{ scale: 1.5, stroke: "#7C3AED" }}
                  className="cursor-pointer"
               />
            ))}
         </svg>
      </div>
   );
};

const CourseUploadModal = ({ onClose }: { onClose: () => void }) => {
   const { t } = useTranslation();
   const [step, setStep] = useState<'upload' | 'details' | 'success'>('upload');
   const [progress, setProgress] = useState(0);

   // Form Data
   const [title, setTitle] = useState('');
   const [desc, setDesc] = useState('');

   useEffect(() => {
      if (step === 'details' && progress < 100) {
         const interval = setInterval(() => {
            setProgress(p => {
               if (p >= 100) {
                  clearInterval(interval);
                  return 100;
               }
               return p + Math.random() * 5; // Random increment
            });
         }, 500);
         return () => clearInterval(interval);
      }
   }, [step, progress]);

   const handlePublish = () => {
      setStep('success');
      confetti({
         particleCount: 150,
         spread: 80,
         origin: { y: 0.6 },
         colors: ['#2563EB', '#7C3AED', '#10B981']
      });
      addNotification(`New Course Available: ${title || 'Untitled Course'}`, 'info');
      setTimeout(onClose, 3000); // Close after success
   };

   return (
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
         <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
         >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-10">
               <X className="w-6 h-6 text-slate-400" />
            </button>

            <AnimatePresence mode="wait">
               {step === 'upload' && (
                  <motion.div key="upload" exit={{ opacity: 0, x: -20 }} className="text-center">
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('upload_course')}</h2>
                     <p className="text-slate-500 mb-8">Create a new learning experience.</p>
                     
                     <div 
                        onClick={() => setStep('details')}
                        className="border-3 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 min-h-[300px] flex flex-col items-center justify-center group hover:border-[#2563EB] hover:bg-blue-50/50 transition-all cursor-pointer"
                     >
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                           <Upload className="w-8 h-8 text-[#2563EB]" />
                        </div>
                        <p className="text-lg font-bold text-slate-700">{t('drop_files_here')}</p>
                        <p className="text-slate-400 text-sm mt-2">MP4, PDF, or SCORM packages</p>
                     </div>
                  </motion.div>
               )}

               {step === 'details' && (
                  <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                     <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Details</h2>
                     
                     <div className="space-y-4 mb-8">
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Course Title</label>
                           <input 
                              type="text" 
                              value={title}
                              onChange={e => setTitle(e.target.value)}
                              placeholder="e.g. Advanced React Patterns"
                              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                           <textarea 
                              rows={3}
                              value={desc}
                              onChange={e => setDesc(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 rounded-xl border border-slate-200 flex items-center gap-3 hover:border-blue-500 cursor-pointer transition-colors">
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-medium text-slate-600">Upload Thumbnail</span>
                           </div>
                           <div className="p-4 rounded-xl border border-slate-200 flex items-center gap-3 hover:border-blue-500 cursor-pointer transition-colors">
                              <Layout className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-medium text-slate-600">Select Category</span>
                           </div>
                        </div>
                     </div>

                     {/* Progress Bar */}
                     <div className="bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                        <motion.div 
                           className="h-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED]"
                           initial={{ width: 0 }}
                           animate={{ width: `${progress}%` }}
                        />
                     </div>
                     <div className="flex justify-between text-xs font-bold text-slate-500 mb-8">
                        <span>Uploading video...</span>
                        <span>{Math.round(progress)}%</span>
                     </div>

                     <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                        <button 
                           onClick={handlePublish}
                           disabled={progress < 100}
                           className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all transform hover:scale-105 ${progress < 100 ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-[#1d4ed8] shadow-blue-500/30'}`}
                        >
                           Publish Course
                        </button>
                     </div>
                  </motion.div>
               )}

               {step === 'success' && (
                  <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center min-h-[300px] text-center">
                     <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle className="w-12 h-12" />
                     </div>
                     <h2 className="text-3xl font-bold text-slate-900 mb-2">Published Successfully!</h2>
                     <p className="text-slate-500">Your course is now live for all students.</p>
                  </motion.div>
               )}
            </AnimatePresence>
         </motion.div>
      </motion.div>
   );
};



const PaymentRequestsView = () => {
   const { t, i18n } = useTranslation();
   const isRTL = i18n.language === 'ar';
   
   const [requests, setRequests] = useState([
      { id: 'TX-98234', student: 'Omar Hassan', plan: 'Monthly Plan', date: '2 mins ago', amount: '250 EGP', status: 'pending' },
      { id: 'TX-98233', student: 'Sarah Ahmed', plan: 'Monthly Plan', date: '15 mins ago', amount: '250 EGP', status: 'pending' },
      { id: 'TX-98232', student: 'Mohamed Ali', plan: 'Yearly Plan', date: '1 hour ago', amount: '2500 EGP', status: 'approved' },
   ]);

   const handleConfirm = (id: string) => {
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      confetti({
         particleCount: 150,
         spread: 60,
         origin: { y: 0.6 },
         colors: ['#2563EB', '#10B981']
      });
      addNotification(`Payment Confirmed for ${id}`, 'success');
   };

   return (
      <div className="space-y-6">
         <h2 className="text-xl font-bold text-slate-800">{t('payment_requests')}</h2>
         
         <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <table className="w-full">
               <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                     <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('transaction_id')}</th>
                     <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>Student</th>
                     <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>Plan</th>
                     <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>Amount</th>
                     <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('status')}</th>
                     <th className="px-8 py-4"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {requests.map((req) => (
                     <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4 font-mono text-slate-600">{req.id}</td>
                        <td className="px-8 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                 {req.student.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                 <p className="font-bold text-slate-800 text-sm">{req.student}</p>
                                 <p className="text-xs text-slate-400">{req.date}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-4 text-sm font-medium text-slate-600">{req.plan}</td>
                        <td className="px-8 py-4 text-sm font-bold text-slate-800">{req.amount}</td>
                        <td className="px-8 py-4">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                           }`}>
                              {req.status === 'approved' ? 'Active' : t('pending_approval')}
                           </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                           {req.status === 'pending' && (
                              <button 
                                 onClick={() => handleConfirm(req.id)}
                                 className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                              >
                                 {t('confirm_payment')}
                              </button>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpload, setShowUpload] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(isRTL ? 'en' : 'ar');
  };

  return (
    <div 
      className={`min-h-screen bg-[#F8FAFC] text-slate-900 font-main flex ${isRTL ? 'font-arabic' : 'font-main'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar */}
      <aside className={`w-72 bg-white/80 backdrop-blur-xl ${isRTL ? 'border-l' : 'border-r'} border-slate-200 p-6 flex flex-col sticky top-0 h-screen z-20`}>
        <div className="flex items-center gap-3 px-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
               <Rocket className="w-6 h-6 fill-white/20" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#7C3AED]">
               {t('brand')} <span className="text-slate-300 font-medium text-sm ml-1">Admin</span>
            </span>
        </div>
        
        <nav className="space-y-2 flex-1">
          {[
            { id: 'overview', icon: BarChart3, label: 'overview' },
            { id: 'courses', icon: BookOpen, label: 'course_manager' },
            { id: 'students', icon: Users, label: 'student_directory' },
            { id: 'payments', icon: CreditCard, label: 'payment_requests' },
            { id: 'announcements', icon: Bell, label: 'announcements' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold ${
                activeTab === item.id 
                  ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/30 translate-x-1' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
              <span>{t(item.label)}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
               <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-slate-500" />
               </div>
               <div>
                  <p className="text-sm font-bold text-slate-800">Admin Settings</p>
                  <p className="text-xs text-slate-500">v2.4.0</p>
               </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none" />
         
        <header className="h-24 flex items-center justify-between px-10 z-10">
          <h1 className="text-2xl font-bold text-slate-800">{t(activeTab === 'overview' ? 'dashboard_overview' : activeTab )}</h1>
          <div className="flex items-center gap-4">
            <div className="relative group">
               <Search className={`w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'}`} />
               <input 
                  type="text" 
                  placeholder={t('search_placeholder')}
                  className={`w-64 bg-white border border-slate-100 rounded-full py-2.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all hover:w-80 shadow-sm`}
               />
            </div>
            
            <button 
               onClick={toggleLanguage}
               className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#2563EB] hover:shadow-lg transition-all"
            >
               <Globe className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] p-[2px]">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full rounded-full bg-white" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 scroll-smooth">
           
           {activeTab === 'overview' && (
             <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard label={t('total_students')} value="12,450" change="+12%" color="from-blue-500 to-cyan-500" />
                  <StatCard label={t('active_courses')} value="48" change="+3%" color="from-purple-500 to-pink-500" />
                  <StatCard label={t('monthly_revenue')} value="$124,500" change="+8.2%" color="from-green-500 to-emerald-500" />
                  <StatCard label={t('pending_assignments')} value="182" change="-5%" color="from-orange-500 to-red-500" />
               </div>

               <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[400px]">
                     <div className="flex justify-between items-center mb-8">
                        <div>
                           <h3 className="font-bold text-lg text-slate-800">Growth Analysis</h3>
                           <p className="text-sm text-slate-400">Student enrollment & revenue trends</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm font-medium text-slate-600 outline-none">
                           <option>Last 30 Days</option>
                           <option>This Year</option>
                        </select>
                     </div>
                     <div className="h-72 w-full">
                        <GrowthChart isRTL={isRTL} />
                     </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-[#2563EB] to-[#7C3AED] rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16" />
                     <h3 className="font-bold text-lg mb-1">{t('active_courses')}</h3>
                     <p className="text-blue-100 text-sm mb-6">Top performing content</p>
                     
                     <div className="space-y-4">
                        {[1,2,3].map(i => (
                           <div key={i} className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                 <BookOpen className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="font-bold text-sm">React Mastery</p>
                                 <p className="text-xs text-blue-200">1.2k students</p>
                              </div>
                           </div>
                        ))}
                     </div>
                     
                     <button className="w-full mt-8 py-3 bg-white text-[#2563EB] rounded-xl font-bold hover:bg-blue-50 transition-colors">
                        View Analytics
                     </button>
                  </div>
               </div>
             </div>
           )}

           {activeTab === 'courses' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <h2 className="text-xl font-bold text-slate-800">All Courses</h2>
                     <button 
                        onClick={() => setShowUpload(true)} 
                        className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl font-bold hover:bg-[#1d4ed8] shadow-lg shadow-blue-500/30 transition-all"
                     >
                        <Plus className="w-5 h-5" />
                        {t('add_new')}
                     </button>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                     <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                           <tr>
                              <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>Name</th>
                              <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('status')}</th>
                              <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>Students</th>
                              <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>Rating</th>
                              <th className="px-8 py-4"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {[1,2,3,4,5].map(i => (
                              <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                 <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                          <BookOpen className="w-6 h-6" />
                                       </div>
                                       <div>
                                          <p className="font-bold text-slate-800">Complete Web Design</p>
                                          <p className="text-xs text-slate-400">Updated 2h ago</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-4">
                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Published</span>
                                 </td>
                                 <td className="px-8 py-4 text-slate-600 font-medium">1,234</td>
                                 <td className="px-8 py-4 text-slate-600 font-medium">4.8/5.0</td>
                                 <td className="px-8 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"><Edit2 className="w-4 h-4" /></button>
                                       <button className="p-2 hover:bg-red-100 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
              </div>
           )}
           {activeTab === 'payments' && <PaymentRequestsView />}

        </div>
      </main>

      <AnimatePresence>
         {showUpload && <CourseUploadModal onClose={() => setShowUpload(false)} />}
      </AnimatePresence>
    </div>
  );
}
