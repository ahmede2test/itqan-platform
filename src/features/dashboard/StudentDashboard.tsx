import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, BarChart2, User, Bell, Rocket, Globe, Eye, EyeOff, Camera, Play, Clock, Award, ChevronLeft, CheckCircle, X, Check, CreditCard, Upload, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../../lib/supabase';
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

const SkeletonCard = () => (
   <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden h-64 flex flex-col justify-between">
      <div className="animate-pulse space-y-6">
         <div className="h-40 bg-slate-100 -mx-6 -mt-6 rounded-t-2xl" />
         <div className="space-y-3">
            <div className="h-4 bg-slate-100 rounded-full w-3/4" />
            <div className="h-3 bg-slate-50 rounded-full w-1/2" />
         </div>
      </div>
      <div className="flex justify-between items-center mt-6">
         <div className="w-20 h-4 bg-slate-50 rounded-full" />
         <div className="w-12 h-4 bg-slate-50 rounded-full" />
      </div>
   </div>
);

const ProfileView = ({ onSave, user, onUpdateImage }: { onSave: (data: any) => void, user: any, onUpdateImage: (type: 'profile' | 'cover', file: File) => void }) => {
   const [showPassword, setShowPassword] = useState(false);
   const profileInputRef = useRef<HTMLInputElement>(null);
   const coverInputRef = useRef<HTMLInputElement>(null);
   const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success'>('idle');
   
   // Store initial data for dirty checking
   const [originalData, setOriginalData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      profileImage: user?.profileImage,
      coverImage: user?.coverImage
   });

   const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      password: ''
   });

   // Intelligent Dirty State detection
   const isDirty = formData.name !== originalData.name || 
                   formData.email !== originalData.email ||
                   formData.password.length > 0 ||
                   user?.profileImage !== originalData.profileImage ||
                   user?.coverImage !== originalData.coverImage;
   
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
      const file = e.target.files?.[0];
      if (file) {
         onUpdateImage(type, file);
      }
   };

   const handleSave = async () => {
      setSaveStatus('loading');
      try {
         await onSave(formData);
         setSaveStatus('success');
         
         // Sync originalData to new saved state
         setOriginalData({
            name: formData.name,
            email: formData.email,
            profileImage: user?.profileImage,
            coverImage: user?.coverImage
         });

         // Clear password field
         setFormData(prev => ({ ...prev, password: '' }));

         // Use setTimeout to allow the user to see the success state
         setTimeout(() => {
            setSaveStatus('idle');
         }, 3000);
      } catch (err) {
         setSaveStatus('idle');
      }
   };
   
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
         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-200 ease-in-out">
            <div className="h-48 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] relative overflow-hidden">
               {user?.coverImage && <img src={user.coverImage} className="w-full h-full object-cover opacity-90" alt="Cover" />}
               <div className="absolute inset-0 bg-black/5" />
               <button 
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute top-6 right-6 px-5 py-2.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-xs font-bold text-white hover:bg-white hover:text-[#2563EB] transition-all duration-200 ease-in-out z-10 shadow-lg"
               >
                  Change Cover
               </button>
               <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
            </div>

            <div className="px-8 pb-10">
               <div className="flex flex-col items-center">
                  {/* Avatar Upload Section - LUXURY OVERLAP */}
                  <div className="relative -mt-24 mb-6 group">
                     <div className="w-44 h-44 rounded-full border-[6px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden bg-slate-50 relative z-20 transition-transform duration-200 ease-in-out group-hover:scale-[1.02]">
                        <img 
                           src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'Felix'}`} 
                           alt="Profile" 
                           className="w-full h-full object-cover" 
                        />
                     </div>
                     <button 
                        onClick={() => profileInputRef.current?.click()}
                        className="absolute bottom-4 right-4 p-3 bg-slate-900 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-200 ease-in-out z-30 hover:scale-110 active:scale-95"
                     >
                        <Camera className="w-5 h-5" />
                     </button>
                     <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
                  </div>

                  {/* Centered User Info */}
                  <div className="text-center mb-10 space-y-1">
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.name || 'Guest User'}</h2>
                     <p className="text-sm font-bold text-[#2563EB]/60 tracking-widest uppercase">{user?.email || 'student@itqan.com'}</p>
                  </div>

                  {/* Intelligent Save Button */}
                  <AnimatePresence>
                     {isDirty && (
                        <motion.div 
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 10, scale: 0.95 }}
                           className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]"
                        >
                           <button 
                              onClick={handleSave}
                              disabled={saveStatus === 'loading'}
                              className={`flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg shadow-2xl transition-all duration-200 ease-in-out min-w-[200px] justify-center ${
                                 saveStatus === 'success' 
                                 ? 'bg-green-500 text-white' 
                                 : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] hover:scale-105 active:scale-95 shadow-blue-500/40'
                              }`}
                           >
                              {saveStatus === 'loading' ? (
                                 <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : saveStatus === 'success' ? (
                                 <>
                                    <Check className="w-6 h-6" />
                                    <span>Saved!</span>
                                 </>
                              ) : (
                                 <span>Save Changes</span>
                              )}
                           </button>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                     <input 
                        type="text" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all duration-200 ease-in-out font-medium" 
                        placeholder="Enter your full name"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                     <input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all duration-200 ease-in-out font-medium"
                        placeholder="your@email.com"
                     />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                     <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                     <div className="relative group/pass">
                        <input 
                           type={showPassword ? "text" : "password"} 
                           value={formData.password}
                           onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                           placeholder="Enter new password to change"
                           className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all duration-200 ease-in-out font-medium" 
                        />
                        <button 
                           type="button"
                           onClick={(e) => {
                              e.preventDefault();
                              setShowPassword(!showPassword);
                           }}
                           className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2563EB] transition-colors duration-200 p-2 rounded-xl hover:bg-white shadow-sm hover:shadow-md"
                        >
                           {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                     </div>
                     <p className="text-xs text-slate-400 ml-1">Leave blank to keep current password</p>
                  </div>
               </div>
            </div>
         </div>
      </motion.div>
   );
};

const BillingView = () => {
   const { t } = useTranslation();
   const [showPayment, setShowPayment] = useState(false);

   return (
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
         <div className="text-center space-y-2 mb-10">
            <h2 className="text-3xl font-bold text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#7C3AED] leading-normal pb-1">{t('premium_features')}</h2>
            <p className="text-slate-500">Unlock your full potential with ITQAN Premium.</p>
         </div>

         <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-purple-500/10 overflow-hidden relative"
         >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7C3AED]/10 to-[#2563EB]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            <div className="p-8 md:p-12 text-center relative z-10">
               <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white text-xs font-bold mb-4 shadow-lg shadow-orange-500/30">
                  Most Popular
               </div>
               <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('monthly_plan')}</h3>
               <div className="flex items-end justify-center gap-1 mb-8">
                  <span className="text-5xl font-extrabold text-slate-900">{t('plan_price')}</span>
                  <span className="text-slate-500 font-medium mb-1">/mo</span>
               </div>

               <div className="space-y-4 max-w-sm mx-auto mb-10 text-left">
                  {[
                     t('unlimited_access'),
                     t('certificate'),
                     t('mentorship'),
                     "Offline Downloads",
                     "Priority Support"
                  ].map((feat, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                           <Check className="w-4 h-4" />
                        </div>
                        <span className="text-slate-600 font-medium">{feat}</span>
                     </div>
                  ))}
               </div>

               <MagneticButton 
                  onClick={() => setShowPayment(true)}
                  className="w-full max-w-sm mx-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#E60000] to-[#B90000] text-white font-bold text-lg hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 transition-all"
               >
                  {t('upgrade_now')}
               </MagneticButton>
            </div>
         </motion.div>

         {/* Vodafone Payment Modal */}
         <AnimatePresence>
            {showPayment && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
               >
                  <motion.div 
                     initial={{ scale: 0.9, y: 30 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.9, y: 30 }}
                     className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                  >
                     <div className="absolute top-0 left-0 w-full h-2 bg-[#E60000]" />
                     <button onClick={() => setShowPayment(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                     </button>

                     <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                           <div className="w-12 h-12 bg-[#E60000] rounded-full flex items-center justify-center text-white text-xl font-bold">V</div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{t('vodafone_cash')}</h2>
                        <p className="text-slate-500 text-sm mt-1">{t('receipt_instructions')}</p>
                     </div>

                     <div className="space-y-4 mb-8">
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">{t('transaction_id')}</label>
                           <input type="text" placeholder="e.g. 23498123" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono" />
                        </div>
                        
                        <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all group">
                           <Upload className="w-8 h-8 text-slate-400 group-hover:text-red-500 mb-2" />
                           <span className="text-sm font-bold text-slate-500 group-hover:text-red-600">{t('upload_receipt')}</span>
                        </div>
                     </div>

                     <button 
                        onClick={() => {
                           setShowPayment(false);
                           confetti({ colors: ['#E60000', '#FFFFFF'] });
                        }}
                        className="w-full py-4 rounded-xl bg-[#E60000] text-white font-bold text-lg hover:bg-[#c40000] hover:shadow-lg hover:shadow-red-500/30 transition-all"
                     >
                        {t('confirm_subscription')}
                     </button>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

const PaymentSubmissionModal = ({ isOpen, onClose, course, onPaymentSubmitted }: { isOpen: boolean, onClose: () => void, course: any, onPaymentSubmitted: () => void }) => {
   const [file, setFile] = useState<File | null>(null);
   const [isUploading, setIsUploading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const [submitted, setSubmitted] = useState(false);

   const handleUpload = async () => {
      if (!file) return;

      // 1. Validation
      if (!file.type.startsWith('image/')) {
         alert('Please upload an image file (PNG, JPG, etc.)');
         return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
         alert('File is too large. Maximum size is 5MB.');
         return;
      }

      setIsUploading(true);
      try {
         // Get fresh session to ensure user_id is exact auth.uid()
         const { data: { session } } = await supabase.auth.getSession();
         if (!session?.user) throw new Error('Action unauthorized. Please log in.');
         
         const userId = session.user.id;
         const fileExt = file.name.split('.').pop();
         const fileName = `${userId}/${course.id}_${Date.now()}.${fileExt}`;
         
         const { error: uploadError } = await supabase.storage
            .from('payments')
            .upload(fileName, file, {
               cacheControl: '3600',
               upsert: true
            });

         if (uploadError) {
            if (uploadError.message.includes('bucket not found')) {
               throw new Error('Storage bucket "payments" not found. Please create it in your Supabase Dashboard -> Storage.');
            }
            throw uploadError;
         }

         const { data: { publicUrl } } = supabase.storage
            .from('payments')
            .getPublicUrl(fileName);

         const { error: requestError } = await supabase.from('payment_requests').insert({
            user_id: userId,
            course_id: course.id,
            amount: 99.00,
            status: 'pending',
            receipt_url: publicUrl
         }).select();

         if (requestError) {
            console.error('Database insertion error details:', requestError);
            throw new Error(`Database Error: ${requestError.message} (${requestError.code})`);
         }

         // Add notification for admin
         const notifications = JSON.parse(localStorage.getItem('itqan_global_notifications') || '[]');
         notifications.unshift({
            id: Date.now(),
            message: `💰 Payment Request: ${session.user.email} submitted proof for "${course?.title}"`,
            type: 'warning',
            timestamp: new Date().toISOString(),
            courseId: course?.id,
            userId: userId
         });
         localStorage.setItem('itqan_global_notifications', JSON.stringify(notifications.slice(0, 50)));

         setSubmitted(true);
         onPaymentSubmitted();
         
         // Auto-close after 3 seconds
         setTimeout(() => {
            onClose();
            // Reset state
            setSubmitted(false);
            setFile(null);
         }, 4000);

      } catch (err: any) {
         console.error('Full Payment Upload Error:', err);
         alert(err.message || 'Failed to upload proof. Please try again.');
      } finally {
         setIsUploading(false);
      }
   };

   return (
      <AnimatePresence>
         {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
               />
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                  
                  {!submitted ? (
                     <>
                        <div className="flex justify-between items-center mb-6">
                           <h3 className="text-2xl font-black text-slate-800 tracking-tight">Access Course</h3>
                           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                              <X className="w-5 h-5 text-slate-400" />
                           </button>
                        </div>

                  <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Total to Pay</h4>
                     <p className="text-4xl font-black text-[#2563EB]">$99<span className="text-lg opacity-50 ml-1">.00</span></p>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <h5 className="text-sm font-bold text-slate-700 mb-3">Upload Transfer Receipt</h5>
                        <input 
                           type="file" 
                           ref={fileInputRef}
                           onChange={(e) => setFile(e.target.files?.[0] || null)}
                           className="hidden" 
                           accept="image/*" 
                        />
                        <button 
                           onClick={() => fileInputRef.current?.click()}
                           className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${file ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'}`}
                        >
                           {file ? (
                              <>
                                 <CheckCircle className="w-8 h-8 text-green-500" />
                                 <span className="text-xs font-bold text-green-600 uppercase tracking-widest">{file.name}</span>
                              </>
                           ) : (
                              <>
                                 <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Upload className="w-6 h-6 text-[#2563EB]" />
                                 </div>
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Image</span>
                              </>
                           )}
                        </button>
                     </div>

                     <button 
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="w-full py-5 bg-[#2563EB] text-white rounded-2xl font-black text-lg hover:bg-[#1d4ed8] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                     >
                        {isUploading ? 'Verifying...' : 'Submit Request'}
                     </button>
                     
                     <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed">
                        By submitting, you agree to our terms. Access is typically granted within 2-4 hours after verification.
                     </p>
                  </div>
                     </>
                  ) : (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-12 flex flex-col items-center text-center"
                     >
                        <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mb-8 relative">
                           <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", delay: 0.2 }}
                              className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl"
                           />
                           <CheckCircle className="w-12 h-12 text-green-500 relative z-10" />
                        </div>
                        
                        <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Thank You!</h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8 px-4">
                           Your payment proof has been successfully submitted. Our team will verify it and unlock your access within <span className="text-[#2563EB] font-bold">2-4 hours</span>.
                        </p>
                        
                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden mb-2">
                           <motion.div 
                              initial={{ width: "100%" }}
                              animate={{ width: "0%" }}
                              transition={{ duration: 4, ease: "linear" }}
                              className="h-full bg-[#2563EB]"
                           />
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Closing Automatically</p>
                     </motion.div>
                  )}
               </motion.div>
            </div>
         )}
      </AnimatePresence>
   );
};

const CoursePlayer = ({ course, isEnrolled, onBack, userData }: { course: any, isEnrolled: boolean, onBack: () => void, userData: any }) => {
   const [paymentStatus, setPaymentStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
   const [showPaymentModal, setShowPaymentModal] = useState(false);
   const isAdmin = userData?.email === 'ahmed.osmanis.fcai@gmail.com';
   
   const fetchPaymentStatus = async () => {
      if (!course?.id || !userData?.id) return;
      try {
         const { data, error } = await supabase
            .from('payment_requests')
            .select('status')
            .eq('user_id', userData.id)
            .eq('course_id', course.id)
            .order('created_at', { ascending: false })
            .limit(1);
         
         if (error) {
            console.error('Payment status fetch error:', error);
            return;
         }

         if (data && data.length > 0) {
            setPaymentStatus(data[0].status as any);
         }
      } catch (err) {
         console.error('Failed to fetch payment status:', err);
      }
   };

   useEffect(() => {
      fetchPaymentStatus();

      // Real-time subscription to auto-unlock
      const paymentSubscription = supabase
         .channel(`payment_${course?.id}`)
         .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'payment_requests',
            filter: `user_id=eq.${userData?.id}` 
         }, (payload) => {
            console.log('Payment status changed:', payload);
            fetchPaymentStatus();
         })
         .subscribe();

      return () => {
         paymentSubscription.unsubscribe();
      };
   }, [course?.id, userData?.id]);


   const hasAccess = isEnrolled || isAdmin || paymentStatus === 'approved';

   // Guard for missing course data
   if (!course) {
      return (
         <div className="absolute inset-0 z-50 bg-[#0f172a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
               <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Course...</p>
            </div>
         </div>
      );
   }

   const handleRequestAccess = () => {
      setShowPaymentModal(true);
   };

   const getYouTubeEmbedUrl = (url: string) => {
      if (!url) return '';
      let videoId = '';
      if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
   };

   return (
      <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 1.1 }} 
         transition={{ duration: 0.5, type: "spring", damping: 25, stiffness: 120 }}
         className="absolute inset-0 z-50 bg-[#0f172a] text-white overflow-hidden flex"
      >
         {/* Sidebar */}
         <div className="w-80 bg-[#1e293b] border-r border-slate-700 flex flex-col hidden md:flex">
            <div className="h-20 flex items-center px-6 border-b border-slate-700">
               <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-bold uppercase tracking-widest text-xs">Exit Classroom</span>
               </button>
            </div>
            <div className="p-6">
               <h2 className="text-xl font-black mb-1">{course?.title || 'Course Content'}</h2>
               <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-bold">Curriculum</p>
               
               <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#2563EB] shadow-lg shadow-blue-500/20 border border-blue-400/20">
                     <div className="flex justify-between items-center mb-1">
                        <h4 className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Active Lesson</h4>
                        <Play className="w-3 h-3 text-white fill-white" />
                     </div>
                     <p className="text-sm font-bold text-white line-clamp-1">{course?.title}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-700/50 opacity-40 grayscale">
                     <div className="flex justify-between items-center mb-1">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Up</h4>
                     </div>
                     <p className="text-sm font-bold text-slate-400">Bonus Materials</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Player Area */}
         <div className="flex-1 flex flex-col relative bg-black">
            {hasAccess ? (
               <div className="w-full h-full">
                  <iframe 
                     src={getYouTubeEmbedUrl(course?.videoUrl)}
                     className="w-full h-full border-none"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                  />
               </div>
            ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 opacity-95" />
                  
                  {/* Luxury Locked UI */}
                  <div className="relative z-10 max-w-md">
                     <div className="w-24 h-24 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                        <EyeOff className="w-10 h-10 text-blue-400 relative z-10" />
                     </div>
                     
                     <h2 className="text-4xl font-black text-white mb-4 tracking-tight leading-tight uppercase">
                        {paymentStatus === 'pending' ? 'Verification Pending' : 'Classroom Locked'}
                     </h2>
                     <p className="text-slate-400 text-lg mb-10 font-medium leading-relaxed">
                        {paymentStatus === 'pending' 
                           ? "Your payment is being verified by our team. Access will be granted shortly." 
                           : "This premium training is reserved for enrolled students. Unlock it now to accelerate your mastery."}
                     </p>
                     
                     <div className="flex flex-col gap-4 w-full">
                        {paymentStatus === 'pending' ? (
                           <div className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-3 w-full">
                              <Clock className="w-6 h-6 text-orange-400" /> Payment Under Review
                           </div>
                        ) : (
                           <button 
                              onClick={handleRequestAccess}
                              className="px-10 py-5 bg-[#2563EB] text-white rounded-2xl font-black text-lg hover:bg-[#1d4ed8] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 w-full"
                           >
                              <CreditCard className="w-6 h-6" /> Unlock Full Access
                           </button>
                        )}
                        <button onClick={onBack} className="text-slate-500 font-bold hover:text-white transition-colors py-2 uppercase tracking-widest text-[10px]">
                           Maybe Later
                        </button>
                     </div>
                  </div>

                  <PaymentSubmissionModal 
                     isOpen={showPaymentModal}
                     onClose={() => setShowPaymentModal(false)}
                     course={course}
                     onPaymentSubmitted={fetchPaymentStatus}
                  />
               </div>
            )}

            {/* Floatback button for mobile */}
            <button 
               onClick={onBack}
               className="md:hidden absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white z-[60]"
            >
               <ChevronLeft className="w-6 h-6" />
            </button>
         </div>
      </motion.div>
   );
};

const AssignmentsView = () => {
   const { t } = useTranslation();
   return (
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -20 }}
         transition={{ duration: 0.3 }}
         className="space-y-6"
      >
         <h2 className="text-2xl font-bold text-slate-800">{t('pending_assignments')}</h2>
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
};

const GradesView = () => {
   const { t } = useTranslation();
   return (
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -20 }}
         transition={{ duration: 0.3 }}
         className="space-y-8"
      >
         <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">{t('performance_overview')}</h2>
            <div className="flex gap-2">
               <span className="w-3 h-3 rounded-full bg-[#2563EB]"></span>
               <span className="text-sm text-slate-500">{t('average_grade')}: A-</span>
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
               <h3 className="font-bold text-slate-700 mb-4">{t('strongest_areas')}</h3>
               <div className="flex flex-wrap gap-2">
                  {['React Hooks', 'CSS Grid', 'API Design'].map(tag => (
                     <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">{tag}</span>
                  ))}
               </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
               <h3 className="font-bold text-slate-700 mb-4">{t('needs_improvement')}</h3>
               <div className="flex flex-wrap gap-2">
                  {['TypeScript Generics', 'Docker'].map(tag => (
                     <span key={tag} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold">{tag}</span>
                  ))}
               </div>
            </div>
         </div>
      </motion.div>
   );
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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

  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<{message: string} | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const fetchDashboardData = async (userId: string) => {
     // Check for cached data to prevent flicker
     const cachedCourses = localStorage.getItem('itqan_student_courses');
     const cachedEnrollments = localStorage.getItem('itqan_student_enrollments');
     
     if (cachedCourses) setCourses(JSON.parse(cachedCourses));
     if (cachedEnrollments) setEnrollments(JSON.parse(cachedEnrollments));
     if (cachedCourses || cachedEnrollments) setLoading(false);

     try {
        const [coursesRes, enrollmentsRes] = await Promise.all([
           supabase.from('courses').select('*').eq('status', 'published').order('createdAt', { ascending: false }),
           supabase.from('enrollments').select('courseId').eq('userId', userId)
        ]);
        
        if (coursesRes.data) {
           setCourses(coursesRes.data);
           localStorage.setItem('itqan_student_courses', JSON.stringify(coursesRes.data));
        }
        if (enrollmentsRes.data) {
           const enrolledIds = enrollmentsRes.data.map((e: any) => e.courseId);
           setEnrollments(enrolledIds);
           localStorage.setItem('itqan_student_enrollments', JSON.stringify(enrolledIds));
        }
     } catch (err) {
        console.error('Error fetching dashboard data:', err);
     } finally {
        setLoading(false);
     }
  };

  useEffect(() => {
    const handleSession = async () => {
      // 1. Check current session
      const { data: { session } } = await supabase.auth.getSession();
      const savedUser = localStorage.getItem('itqan_user');
      const localData = savedUser ? JSON.parse(savedUser) : null;
      
      if (session?.user) {
        // Fetch or update local user data
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // FALLBACK/FAILSAFE: If user exists in Auth but not in public.users, create it now
        if (!profile && localData?.name) {
           console.log('User profile missing in DB, attempting failsafe sync...');
           await supabase.from('users').upsert({
              id: session.user.id,
              name: localData.name,
              email: session.user.email,
              role: localData.role || 'STUDENT'
           });
        }

        const fullData = {
          id: session.user.id,
          email: session.user.email,
          // PRIORITY: 1. DB name, 2. Local fallback, 3. Email prefix
          name: profile?.name || localData?.name || session.user.email?.split('@')[0],
          role: profile?.role || localData?.role || 'STUDENT',
          profileImage: profile?.profileImage || localData?.profileImage,
          coverImage: profile?.coverImage || localData?.coverImage
        };

        setUserData(fullData);
        localStorage.setItem('itqan_user', JSON.stringify(fullData));
        await fetchDashboardData(session.user.id);
        setLoading(false);
      } else if (localData) {
        setUserData(localData);
        if (localData.id) await fetchDashboardData(localData.id);
        setLoading(false);
      } else {
        navigate('/');
      }
    };

    handleSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        localStorage.removeItem('itqan_user');
        navigate('/');
      }
    });

    // Existing notification logic...


    // Initial check for notifications
    const checkNotifications = () => {
       const notifs = JSON.parse(localStorage.getItem('itqan_global_notifications') || '[]');
       const unreadCount = notifs.filter((n: any) => !n.read).length;
       if (unreadCount > 0) setShowNotifications(true);
    };
    checkNotifications();

    // Listen for global updates
    window.addEventListener('storage', checkNotifications);

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
       }, 3000);
    }
    
    return () => {
       window.removeEventListener('storage', checkNotifications);
       subscription.unsubscribe();
    };
  }, []);

  // 3. Real-time Global Sync for Enrollments/Access
  useEffect(() => {
    if (!userData?.id) return;

    console.log('📡 StudentDashboard: Initializing Global Enrollment Listener');
    const enrollmentChannel = supabase
       .channel('enrollment-updates', {
          config: {
             broadcast: { ack: true }
          }
       })
       .on('broadcast', { event: 'enrollment-approved' }, (payload: any) => {
          console.log('📡 Global: Received enrollment approval:', payload);
          
          if (payload.payload?.userId === userData.id) {
             const courseId = payload.payload.courseId;
             const courseName = payload.payload.courseName;

             // Instantly update enrollments state
             setEnrollments(prev => [...new Set([...prev, courseId])]);
             
             // Visual feedback
             showToast(`🎉 Course Unlocked: ${courseName || 'New Course'}`);
             confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#2563EB', '#7C3AED', '#10B981']
             });
          }
       })
       .on('broadcast', { event: 'enrollment-cancelled' }, (payload: any) => {
          console.log('📡 Global: Received enrollment cancellation:', payload);
          
          if (payload.payload?.userId === userData.id) {
             const courseId = payload.payload.courseId;
             const courseName = payload.payload.courseName;

             // Instantly update enrollments state
             setEnrollments(prev => prev.filter(id => id !== courseId));
             
             // Handle Classroom "Kick-out" if active
             if (viewMode === 'player' && selectedCourse?.id === courseId) {
                console.log('🔒 Real-time Kick-out triggered for course:', courseId);
                setViewMode('dashboard');
                setSelectedCourse(null);
                alert(`⚠️ Access Revoked: "${courseName || 'Course'}" has been locked by admin.`);
             } else {
                showToast(`⚠️ Access Revoked for ${courseName || 'a course'}`);
             }
          }
       })
       .subscribe((status) => {
          console.log('📡 Global Enrollment Channel Status:', status);
       });

    return () => {
       console.log('📡 Cleaning up Global Enrollment Listener');
       supabase.removeChannel(enrollmentChannel);
    };
  }, [userData?.id, viewMode, selectedCourse]); // Recalculate if these change to keep closures fresh

  const showToast = (message: string) => {
      setToast({ message });
      setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
     await supabase.auth.signOut();
     localStorage.removeItem('itqan_user');
     navigate('/');
  };

  const updateImage = async (type: 'profile' | 'cover', file: File) => {
     if (!userData?.id) return;

     // 1. Instant local preview for better UX
     const localUrl = URL.createObjectURL(file);
     const previewData = { ...userData };
     if (type === 'profile') previewData.profileImage = localUrl;
     else previewData.coverImage = localUrl;
     setUserData(previewData);

     try {
        setLoading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${userData.id}/${type}_${Date.now()}.${fileExt}`;
        const filePath = fileName;

        // 2. Upload to Supabase Storage (public 'profiles' bucket)
        const { error: uploadError } = await supabase.storage
           .from('profiles')
           .upload(filePath, file, { 
              upsert: true,
              cacheControl: '3600'
           });

        if (uploadError) throw uploadError;

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase.storage
           .from('profiles')
           .getPublicUrl(filePath);

        // 4. Update Database profile directly
        const { error: dbError } = await supabase
           .from('users')
           .update({ [type === 'profile' ? 'profileImage' : 'coverImage']: publicUrl })
           .eq('id', userData.id);

        if (dbError) throw dbError;

        // 5. Finalize state with the permanent URL
        const finalData = { ...userData, [type === 'profile' ? 'profileImage' : 'coverImage']: publicUrl };
        setUserData(finalData);
        localStorage.setItem('itqan_user', JSON.stringify(finalData));
        showToast('Image updated successfully!');
        
     } catch (err: any) {
        console.error('Image upload failed:', err);
        showToast(`Upload failed: ${err.message || 'Check storage permissions'}`);
        // Revert to original data on failure
        const saved = localStorage.getItem('itqan_user');
        if (saved) setUserData(JSON.parse(saved));
     } finally {
        setLoading(false);
     }
  };


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
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">{t('your_progress')}</h2>
                    <button className="text-sm font-bold text-[#2563EB] hover:text-[#7C3AED] transition-colors">{t('view_all')}</button>
                 </div>
                 
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => <SkeletonCard key={i} />)
                    ) : courses.length > 0 ? (
                        courses.map((course) => {
                           const isEnrolled = enrollments.includes(course.id);
                           const isMasterAdmin = userData?.email === 'ahmed.osmanis.fcai@gmail.com';
                           const hasAccess = isEnrolled || isMasterAdmin;

                           return (
                              <TiltCard 
                                 key={course.id}
                                 variants={itemVariants}
                                 className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group cursor-pointer"
                                 onClick={() => {
                                    setSelectedCourse(course);
                                    setViewMode('player');
                                 }}
                              >
                                 <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                                    {course.thumbnailUrl ? (
                                       <img src={course.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                                    ) : (
                                       <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
                                    )}
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                    
                                    {!hasAccess && (
                                       <div className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20">
                                          <EyeOff className="w-4 h-4 text-white" />
                                       </div>
                                    )}
                                    
                                    {hasAccess && (
                                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 text-white">
                                             <Play className="w-6 h-6 fill-white ml-1" />
                                          </div>
                                       </div>
                                    )}
                                 </div>

                                 <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                       <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Academy Course</span>
                                       {hasAccess && <CheckCircle className="w-4 h-4 text-green-500" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 line-clamp-2 leading-tight">{course.title}</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                       <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                          <Play className="w-3 h-3" /> Video Training
                                       </div>
                                       {hasAccess ? (
                                          <div className="flex items-center gap-2 text-green-500 text-xs font-bold uppercase tracking-widest">
                                             <Check className="w-3 h-3" /> Unlocked
                                          </div>
                                       ) : (
                                          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                             <CreditCard className="w-3 h-3" /> Premium
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </TiltCard>
                           );
                        })
                    ) : (
                       <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-slate-100">
                          <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No courses available in your region.</p>
                       </div>
                    )}
                 </div>
              </section>

              {/* Learning Path */}
              <section>
                 <h2 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-wider">{t('recommended_path')}</h2>
                 <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#F59E0B]" />
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#F97316] flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                          <Rocket className="w-10 h-10 fill-white/20" />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{t('mastering_fullstack')}</h3>
                          <p className="text-slate-500 max-w-xl">{t('path_desc')}</p>
                       </div>
                       <MagneticButton onClick={() => setViewMode('player')} className="ml-auto px-8 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-[#2563EB] transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-95">
                          {t('continue_journey')}
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
         return (
            <ProfileView 
               key="profile" 
               user={userData} 
               onUpdateImage={updateImage} 
               onSave={async (data: any) => {
                  if (!userData?.id) return;
                  
                  try {
                     setLoading(true);
                     // 1. Update Database (Name/Email)
                     const { error: dbError } = await supabase
                        .from('users')
                        .update({ 
                           name: data.name,
                           email: data.email
                        })
                        .eq('id', userData.id);

                     if (dbError) throw dbError;

                     // 2. Update Password (if provided)
                     if (data.password && data.password.length > 0) {
                        const { error: authError } = await supabase.auth.updateUser({
                           password: data.password
                        });
                        if (authError) throw authError;
                        showToast('Profile and Password updated!');
                     } else {
                        showToast('Profile updated successfully!');
                     }

                     const updated = { ...userData, ...data };
                     // Don't save password to local storage/state
                     delete (updated as any).password;
                     
                     setUserData(updated);
                     localStorage.setItem('itqan_user', JSON.stringify(updated));
                     
                     confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#2563EB', '#7C3AED']
                     });
                  } catch (err: any) {
                     console.error('Save failed:', err);
                     showToast(`Error: ${err.message}`);
                  } finally {
                     setLoading(false);
                  }
               }} 
            />
         );
      case 'billing':
         return <BillingView key="billing" />;
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
                       {t('brand')}
                     </span>
                  </div>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2">
                  {[
                    { id: 'courses', icon: BookOpen, label: 'my_courses' },
                    { id: 'assignments', icon: FileText, label: 'assignments' },
                    { id: 'grades', icon: BarChart2, label: 'grades' },
                    { id: 'billing', icon: CreditCard, label: 'billing' },
                    { id: 'profile', icon: User, label: 'profile' },
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
                      <span className="text-sm relative z-10">{t(item.label)}</span>
                    </button>
                  ))}

                   <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group mt-4"
                   >
                       <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                       <span className="text-sm font-bold">Logout</span>
                   </button>
                 </nav>

                <div className="p-4 border-t border-[#2563EB]/10">
                   <div className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/50 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] p-[2px] shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                         <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                            <img 
                              src={userData?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                              alt="User" 
                              className="w-full h-full object-cover"
                            />
                         </div>
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors">{userData?.name || t('student')}</p>
                         <p className="text-xs text-slate-500">{t('student')}</p>
                      </div>
                   </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header */}
                <header className="h-24 flex items-center justify-between px-8 z-10">
                  <div>
                     <h1 className="text-2xl font-bold text-slate-900">
                        {t('welcome_back')}{userData?.name ? `, ${userData.name}` : ''}!
                     </h1>
                     <p className="text-slate-500 text-sm">{t('continue_learning')}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <button 
                       onClick={toggleLanguage}
                       className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#7C3AED] hover:border-[#7C3AED]/30 hover:shadow-lg transition-all"
                     >
                        <Globe className="w-5 h-5" />
                     </button>
                     <div className="relative">
                        <button 
                           onClick={() => setShowNotifications(!showNotifications)}
                           className={`w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#F59E0B] hover:border-[#F59E0B]/30 hover:shadow-lg transition-all relative ${showNotifications ? 'text-[#F59E0B] border-[#F59E0B]/30' : ''}`}
                        >
                           <Bell className="w-5 h-5" />
                           <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </button>
                        
                        <AnimatePresence>
                           {showNotifications && (
                              <motion.div 
                                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                 animate={{ opacity: 1, y: 0, scale: 1 }}
                                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                 className={`absolute top-14 ${isRTL ? 'left-0' : 'right-0'} w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50`}
                              >
                                 <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
                                    <h3 className="font-bold text-slate-800">{t('notifications')}</h3>
                                    <span className="text-xs bg-[#2563EB]/10 text-[#2563EB] px-2 py-1 rounded-full font-bold">3 {t('new')}</span>
                                 </div>
                                  <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {(() => {
                                       const global = JSON.parse(localStorage.getItem('itqan_global_notifications') || '[]');
                                       const personal = JSON.parse(localStorage.getItem(`itqan_notifications_${userData?.id}`) || '[]');
                                       const combined = [...personal, ...global].sort((a, b) => b.id - a.id);
                                       
                                       return combined.length === 0 ? (
                                          <p className="text-center text-sm text-slate-400 py-4">No new notifications</p>
                                       ) : (
                                          combined.map((notif, i) => (
                                          <motion.div 
                                             key={notif.id || i}
                                             initial={{ opacity: 0, x: -20 }}
                                             animate={{ opacity: 1, x: 0 }}
                                             transition={{ delay: i * 0.1 }}
                                             className="flex gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer"
                                          >
                                             <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                                notif.type === 'success' ? 'bg-green-500' : notif.type === 'info' ? 'bg-blue-500' : 'bg-orange-500'
                                             }`} />
                                             <div>
                                                <p className="text-sm font-medium text-slate-700 leading-tight">{notif.message}</p>
                                                <p className="text-xs text-slate-400 mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                                             </div>
                                          </motion.div>
                                          ))
                                       );
                                    })()}
                                 </div>
                                 <button className="w-full mt-4 py-2 text-xs font-bold text-center text-slate-500 hover:text-[#2563EB] transition-colors">
                                    {t('mark_all_read')}
                                 </button>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
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
            <CoursePlayer 
               key="player"
               course={selectedCourse} 
               isEnrolled={enrollments.includes(selectedCourse?.id || '')}
               userData={userData}
               onBack={() => {
                  setViewMode('dashboard');
                  setSelectedCourse(null);
               }} 
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
         {toast && (
            <motion.div 
               initial={{ opacity: 0, y: -50, x: isRTL ? -20 : 20 }}
               animate={{ opacity: 1, y: 0, x: 0 }}
               exit={{ opacity: 0, y: -50 }}
               className={`fixed top-8 ${isRTL ? 'left-8' : 'right-8'} z-[100] flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-green-100`}
            >
               <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Check className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="font-bold text-slate-800">Success</h4>
                  <p className="text-sm text-slate-500">{toast.message}</p>
               </div>
               <button onClick={() => setToast(null)} className="ml-4 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
               </button>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
