import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Users, BookOpen, Settings, Bell, Search, Upload, Plus, Globe, Trash2, Edit2, Rocket, CheckCircle, X, CreditCard, LogOut, Shield, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { addNotification } from '../../lib/notifications';

import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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

   const handlePublish = async () => {
      // In a real scenario, you save the video URL (secureUrl) to MongoDB here via another API call
      setStep('success');
      confetti({
         particleCount: 150,
         spread: 80,
         origin: { y: 0.6 },
         colors: ['#2563EB', '#7C3AED', '#10B981']
      });
      addNotification(`New Course Available: ${title || 'Untitled Course'}`, 'info');
      setTimeout(onClose, 3000);
   };

   const uploadFile = async (file: File) => {
      try {
         // 1. Get Signature
         // For demo purposes, we are hardcoding the admin email check in the body. 
         //Ideally this comes from a secure session.
         const authRes = await fetch('/api/courses/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'ahmedosman@example.com' }) // Replace with dynamic user email
         });
         
         const authData = await authRes.json();
         if (!authRes.ok) throw new Error(authData.error);

         // 2. Upload to Cloudinary
         const formData = new FormData();
         formData.append('file', file);
         formData.append('api_key', authData.apiKey);
         formData.append('timestamp', authData.timestamp.toString());
         formData.append('signature', authData.signature);
         formData.append('folder', 'itqan_courses');

         const xhr = new XMLHttpRequest();
         xhr.open('POST', `https://api.cloudinary.com/v1_1/${authData.cloudName}/auto/upload`);
         
         xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
               const p = (e.loaded / e.total) * 100;
               setProgress(p);
            }
         };

         xhr.onload = () => {
            if (xhr.status === 200) {
               // Handle Course Upload
               // ... course upload logic
               // setVideoUrl(response.secure_url);
               setStep('details');
            } else {
               alert('Upload failed');
               setStep('upload');
            }
         };

         xhr.send(formData);
         setStep('details'); // Move to details immediately to show progress bar there or stay? 
         // Let's modify logic to show progress in 'upload' step or move to 'details' with progress.
         // For now, moving to details and simulating or using the progress.
      } catch (err: any) {
         alert(err.message);
      }
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
                     
                     <label 
                        className="border-3 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 min-h-[300px] flex flex-col items-center justify-center group hover:border-[#2563EB] hover:bg-blue-50/50 transition-all cursor-pointer relative overflow-hidden"
                     >
                        <input 
                           type="file" 
                           accept="video/*" 
                           className="hidden" 
                           onChange={(e) => {
                              if (e.target.files?.[0]) uploadFile(e.target.files[0]);
                           }}
                        />
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform relative z-10">
                           <Upload className="w-8 h-8 text-[#2563EB]" />
                        </div>
                        <p className="text-lg font-bold text-slate-700 relative z-10">{t('drop_files_here')}</p>
                        <p className="text-slate-400 text-sm mt-2 relative z-10">MP4, PDF, or SCORM packages</p>
                     </label>
                  </motion.div>
               )}

               {step === 'details' && (
                  <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                     <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Details</h2>
                     
                     {/* Luxury Neon Progress Bar */}
                     <div className="mb-8 p-6 bg-slate-900 rounded-2xl relative overflow-hidden shadow-lg shadow-blue-500/20">
                        <div className="flex justify-between text-white font-bold mb-2 relative z-10">
                           <span>Uploading to Cloud Server...</span>
                           <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative z-10">
                           <motion.div 
                              className="h-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] relative"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                           >
                              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/50 blur-sm" />
                           </motion.div>
                        </div>
                        {/* Background glow for neon effect */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-500/20 blur-xl" />
                     </div>

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

const AdminSettingsView = ({ userData, onUpload, uploadState }: { userData: any, onUpload: (e: any, type: 'profile' | 'cover') => void, uploadState: any }) => {
   const { t } = useTranslation();
   const profileInputRef = useRef<HTMLInputElement>(null);
   const coverInputRef = useRef<HTMLInputElement>(null);
   
   return (
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="max-w-4xl mx-auto"
      >
         {/* Hidden Inputs */}
         <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => onUpload(e, 'profile')} />
         <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => onUpload(e, 'cover')} />

         {/* Luxury Admin Profile Card (Overlap UI) */}
         <div className="bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative border border-purple-500/20">
            {/* Cover Image (Admin Palette) */}
            <div className="h-64 relative overflow-hidden group">
               {userData?.coverImage ? (
                  <img src={userData.coverImage} className="w-full h-full object-cover" alt="Cover" />
               ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1E293B] via-[#4C1D95] to-[#1E293B]" />
               )}
               <div className="absolute inset-0 bg-black/20" />
               <div className="absolute top-10 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
               
               {/* Change Cover Button */}
               <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute top-6 right-6 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl flex items-center gap-2 text-white text-sm font-bold transition-all z-20 group"
               >
                  <Camera className="w-4 h-4 text-purple-300 group-hover:rotate-12 transition-transform" />
                  <span>Change Cover</span>
               </motion.button>

               {/* Luxury Progress Bar for Cover */}
               {uploadState.loading && uploadState.type === 'cover' && (
                  <div className="absolute inset-x-0 bottom-0 p-8 z-30">
                     <div className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                              <Rocket className="w-3 h-3 text-blue-400 animate-bounce" /> Updating Horizon...
                           </span>
                           <span className="text-purple-400 text-xs font-black">{uploadState.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadState.progress}%` }}
                              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                           />
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Profile Overlap UI */}
            <div className="px-12 pb-12 -mt-20 relative z-10 flex flex-col items-center">
               <div className="relative group">
                  <div className="w-40 h-40 rounded-[2.5rem] border-8 border-slate-900 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                     <img 
                        src={userData?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
                        alt="Admin" 
                        className="w-full h-full object-cover" 
                     />
                     
                     {/* Camera Overlay */}
                     <button 
                        onClick={() => profileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]"
                     >
                        <div className="p-3 bg-white/20 rounded-2xl border border-white/40 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                           <Camera className="w-6 h-6 text-white" />
                        </div>
                     </button>

                     {/* Profile Upload Progress */}
                     {uploadState.loading && uploadState.type === 'profile' && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
                           <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-2" />
                           <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{uploadState.progress}%</span>
                        </div>
                     )}
                  </div>
                  <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-t from-purple-500/20 to-transparent pointer-events-none" />
               </div>

               <div className="mt-8 text-center">
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase mb-1">ahmed</h2>
                  <div className="flex items-center gap-2 justify-center">
                     <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black tracking-[0.2em] uppercase">
                        MASTER ADMIN
                     </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm font-medium">
                     <Shield className="w-4 h-4 text-purple-500" />
                     {userData?.email}
                  </div>
               </div>

               {/* Admin Actions / Settings Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-12">
                  <div className="p-8 bg-slate-800/50 rounded-3xl border border-white/5 backdrop-blur-md">
                     <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-400" /> System Preferences
                     </h3>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-slate-400 text-sm">
                           <span>Maintenance Mode</span>
                           <div className="w-12 h-6 bg-slate-700 rounded-full relative">
                              <div className="absolute right-1 top-1 w-4 h-4 bg-slate-400 rounded-full" />
                           </div>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 text-sm">
                           <span>Analytics Syncing</span>
                           <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-slate-800/50 rounded-3xl border border-white/5 backdrop-blur-md">
                     <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-purple-400" /> Notification Engine
                     </h3>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-slate-400 text-sm">
                           <span>New Signup Alerts</span>
                           <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                           </div>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 text-sm">
                           <span>Payment Webhooks</span>
                           <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </motion.div>
   );
};

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [uploadState, setUploadState] = useState<{ loading: boolean; progress: number; type: 'profile' | 'cover' | null }>({
    loading: false,
    progress: 0,
    type: null
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('itqan_user');
    navigate('/');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !userData) return;

    try {
      setUploadState({ loading: true, progress: 10, type });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.id}/${type}_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log(`[STORAGE] Starting upload for ${type}...`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('[STORAGE_ERROR]', uploadError);
        throw uploadError;
      }
      console.log('[STORAGE_SUCCESS]', uploadData);

      const { data: { publicUrl: rawUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Cache-Busting: Force browser to reload the image
      const publicUrl = `${rawUrl}?t=${Date.now()}`;
      console.log('[PUBLIC_URL_GENERATED]', publicUrl);

      const updateData = type === 'profile' 
        ? { profileImage: rawUrl } // Correct camelCase matching schema
        : { coverImage: rawUrl };

      console.log(`[DATABASE] Updating user ${userData.id} with payload:`, updateData);
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userData.id);

      if (updateError) {
        console.error('[DATABASE_ERROR]', updateError);
        throw updateError;
      }
      console.log('[DATABASE_SUCCESS] Profile saved to database.');

      const updatedUser = { 
        ...userData, 
        ...(type === 'profile' ? { profileImage: publicUrl } : { coverImage: publicUrl }) 
      };
      
      setUserData(updatedUser);
      localStorage.setItem('itqan_user', JSON.stringify(updatedUser));
      setUploadState({ loading: false, progress: 100, type: null });

      confetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.8 },
        colors: ['#2563EB', '#7C3AED']
      });

    } catch (error) {
      console.error('[UPLOAD_FAILED]', error);
      setUploadState({ loading: false, progress: 0, type: null });
      alert('Upload failed. Check console for details or verify RLS policies in Supabase.');
    }
  };

  useEffect(() => {
    const sessionStr = localStorage.getItem('itqan_user');
    if (!sessionStr) {
      navigate('/');
      return;
    }

    const user = JSON.parse(sessionStr);
    if (user.role !== 'ADMIN' || user.email !== 'ahmed.osmanis.fcai@gmail.com') {
      navigate('/dashboard');
      return;
    }

    setUserData({
       ...user,
       name: 'ahmed',
       role: 'MASTER ADMIN'
    });
    setIsLoading(false);

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#7C3AED']
    });
  }, [navigate]);

  const toggleLanguage = () => {
    i18n.changeLanguage(isRTL ? 'en' : 'ar');
  };

  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Security...</p>
      </div>
    </div>
  );

  return (
    <div 
      className={`min-h-screen bg-[#F8FAFC] text-slate-900 font-main flex ${isRTL ? 'font-arabic' : 'font-main'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar */}
      <aside className={`w-72 bg-white/70 backdrop-blur-2xl ${isRTL ? 'border-l' : 'border-r'} border-[#2563EB]/10 p-6 flex flex-col sticky top-0 h-screen z-20 shadow-xl shadow-blue-900/5`}>
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
            { id: 'settings', icon: Settings, label: 'Admin Settings' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold group relative ${
                activeTab === item.id 
                  ? 'text-[#2563EB] shadow-lg shadow-blue-500/10 active-nav' 
                  : 'text-slate-500 hover:bg-white hover:text-[#2563EB] hover:shadow-md'
              }`}
            >
              {activeTab === item.id && (
                 <motion.div 
                    layoutId="adminNav"
                    className="absolute inset-0 bg-gradient-to-r from-[#2563EB]/5 to-[#7C3AED]/5 rounded-2xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                 />
              )}
              <item.icon className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-[#2563EB]' : 'text-slate-400'}`} />
              <span className="relative z-10">{t(item.label)}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
            <button 
               onClick={handleLogout}
               className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all group"
            >
               <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
               <span className="text-sm font-bold">Logout</span>
            </button>

            <button 
               onClick={() => setActiveTab('settings')}
               className={`w-full flex items-center gap-3 p-3 rounded-2xl bg-white/50 border ${activeTab === 'settings' ? 'border-[#2563EB]' : 'border-[#2563EB]/10'} backdrop-blur-sm transition-all hover:shadow-lg text-left`}
            >
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] p-[2px]">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                     <img 
                        src={userData?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
                        alt="Admin" 
                        className="w-full h-full object-cover" 
                     />
                  </div>
               </div>
               <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 leading-tight truncate">ahmed</p>
                  <p className="text-[10px] font-black text-[#2563EB]/60 tracking-widest uppercase truncate">MASTER ADMIN</p>
               </div>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
         <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-tr from-[#2563EB]/5 to-[#7C3AED]/5 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#10B981]/5 to-[#F59E0B]/5 rounded-full blur-[100px] pointer-events-none" />
         
        <header className="h-24 flex items-center justify-between px-10 z-10">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{t(activeTab === 'overview' ? 'dashboard_overview' : activeTab )}</h1>
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

            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] p-[2px] shadow-lg shadow-blue-500/20 group">
               <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src={userData?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
                    alt="Admin" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                  />
               </div>
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
           {activeTab === 'settings' && <AdminSettingsView userData={userData} onUpload={handleFileChange} uploadState={uploadState} />}

        </div>
      </main>

      <AnimatePresence>
         {showUpload && <CourseUploadModal onClose={() => setShowUpload(false)} />}
      </AnimatePresence>
    </div>
  );
}
