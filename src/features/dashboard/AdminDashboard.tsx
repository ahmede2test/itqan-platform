import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, BookOpen, Settings, Bell, Search, Plus, 
  Globe, Rocket, X, CreditCard, LogOut, Shield, Camera, RefreshCcw, Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { supabase } from '../../lib/supabase';
import { sendApprovalEmail as sendRealEmail } from '../../lib/resend';

// Refactored Components
import { OverviewStats } from '../../components/dashboard/StatCards';
import { AnalyticsChart } from '../../components/dashboard/AnalyticsChart';
import { CourseList, ActiveCourses } from '../../components/dashboard/CourseList';
import { LessonManager } from '../../components/dashboard/LessonManager';
import { StudentDirectory } from '../../components/dashboard/StudentDirectory';

// Local utility for notifications
const addNotification = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
  console.log(`[Admin] ${type.toUpperCase()}: ${message}`);
};



const CourseUploadModal = ({ onClose, onSuccess, course }: { onClose: () => void, onSuccess: () => void, course?: any }) => {
   const [loading, setLoading] = useState(false);
   const [title, setTitle] = useState(course?.title || '');
   const [videoUrl, setVideoUrl] = useState(course?.videoUrl || '');
   const [thumbnail, setThumbnail] = useState<File | null>(null);
   const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(course?.thumbnailUrl || null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         setThumbnail(file);
         const reader = new FileReader();
         reader.onloadend = () => setThumbnailPreview(reader.result as string);
         reader.readAsDataURL(file);
      }
   };

   const handlePublish = async () => {
      if (!title || !videoUrl || (!thumbnail && !course?.thumbnailUrl)) {
         alert('Please fill all fields and select a thumbnail');
         return;
      }

      setLoading(true);
      try {
         let currentThumbnailUrl = course?.thumbnailUrl;

         if (thumbnail) {
            console.log('🚀 Uploading new thumbnail...');
            const fileExt = thumbnail.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `course-thumbnails/${fileName}`;

            const { error: uploadError } = await supabase.storage
               .from('avatars')
               .upload(filePath, thumbnail);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
               .from('avatars')
               .getPublicUrl(filePath);
            
            currentThumbnailUrl = publicUrl;
         }

         const courseData = {
            title,
            videoUrl,
            thumbnailUrl: currentThumbnailUrl,
            status: course?.status || 'published',
            createdAt: course?.createdAt || new Date().toISOString()
         };

         if (course?.id) {
            console.log('💾 Updating course:', course.id);
            const { error: updateError } = await supabase
               .from('courses')
               .update(courseData)
               .eq('id', course.id);
            
            if (updateError) throw updateError;
            addNotification(`Course Updated: ${title}`, 'success');
         } else {
            console.log('💾 Saving new course:', courseData);
            const { error: saveError } = await supabase
               .from('courses')
               .insert([courseData]);
            
            if (saveError) throw saveError;
            addNotification(`New Course Published: ${title}`, 'success');
         }

         confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#2563EB', '#7C3AED', '#10B981']
         });

         onSuccess();
         setTimeout(onClose, 1000);
      } catch (err: any) {
         console.error('Course save error:', err);
         alert('Failed to save course: ' + err.message);
      } finally {
         setLoading(false);
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
            className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent"
         >
            <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 transition-colors z-10">
               <X className="w-6 h-6 text-slate-400" />
            </button>

            <h2 className="text-3xl font-black text-slate-900 mb-2">Create New Course</h2>
            <p className="text-slate-500 mb-8">Deploy your learning content with high speed.</p>

            <div className="space-y-6">
               {/* Thumbnail Upload */}
               <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden relative group"
               >
                  {thumbnailPreview ? (
                     <>
                        <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Camera className="w-10 h-10 text-white" />
                        </div>
                     </>
                  ) : (
                     <>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                           <Camera className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="font-bold text-slate-600">Upload Course Thumbnail</p>
                        <p className="text-xs text-slate-400 mt-1">16:9 Aspect Ratio Recommended</p>
                     </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleThumbnailChange} />
               </div>

               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">Course Title</label>
                     <input 
                        type="text" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Mastering Modern UI/UX"
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">YouTube Video Link (Unlisted)</label>
                     <div className="relative">
                        <input 
                           type="text" 
                           value={videoUrl}
                           onChange={e => setVideoUrl(e.target.value)}
                           placeholder="https://www.youtube.com/watch?v=..."
                           className="w-full px-5 py-4 pr-12 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium"
                        />
                        <Rocket className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <button 
                     onClick={onClose}
                     className="flex-1 py-4 rounded-2xl font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                     Cancel
                  </button>
                  <button 
                     onClick={handlePublish}
                     disabled={loading}
                     className="flex-[2] py-4 bg-[#2563EB] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-[#1d4ed8] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                  >
                     {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                     ) : (
                        <>
                           <Rocket className="w-5 h-5" />
                           Deploy Course
                        </>
                     )}
                  </button>
               </div>
            </div>
         </motion.div>
      </motion.div>
   );
};



// Redundant placeholder removed, using src/lib/resend.ts instead

const AdminPaymentRequestsView = () => {
   const { i18n } = useTranslation();
   const isRTL = i18n.language === 'ar';
   const [requests, setRequests] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fetchRequests = async () => {
       // Only show loading if we don't have cached data
       const cached = localStorage.getItem('itqan_admin_payment_requests');
       if (!cached) setLoading(true);
       
       try {
          // Attempt simple fetch first to avoid relationship errors if schema isn't synced
           const { data: rawRequests, error: fetchError } = await supabase
              .from('payment_requests')
              .select('*')
              .order('created_at', { ascending: false });
           
           if (fetchError) throw fetchError;

          if (!rawRequests || rawRequests.length === 0) {
             setRequests([]);
             localStorage.setItem('itqan_admin_payment_requests', '[]');
             return;
          }

            // Normalize data to support both snake_case and camelCase to prevent UUID errors
            const normalizedRequests = rawRequests.map(r => ({
               ...r,
               userId: r.userId || r.user_id,
               courseId: r.courseId || r.course_id,
               receipt_url: r.receipt_url || r.receiptUrl
            }));

            // Manually resolve users and courses to bypass nested relationship errors
            const userIds = [...new Set(normalizedRequests.map(r => r.userId).filter(Boolean))];
            const courseIds = [...new Set(normalizedRequests.map(r => r.courseId).filter(Boolean))];

          const [{ data: users }, { data: courses }] = await Promise.all([
             supabase.from('users').select('id, name, email').in('id', userIds),
             supabase.from('courses').select('id, title').in('id', courseIds)
          ]);

            const resolvedData = normalizedRequests.map(req => ({
               ...req,
               user: users?.find(u => u.id === req.userId),
               course: courses?.find(c => c.id === req.courseId)
            }));

          setRequests(resolvedData);
          localStorage.setItem('itqan_admin_payments', JSON.stringify(resolvedData));

       } catch (error: any) {
          console.error('Admin Payment Fetch Error:', error);
          addNotification(`Fetch failed: ${error.message}`, 'error');
          // If fetch fails, keep showing cached data if we have it
       } finally {
          setLoading(false);
       }
    };

   useEffect(() => {
      // Load from cache first for zero-flicker
      const cached = localStorage.getItem('itqan_admin_payments');
      if (cached) {
         setRequests(JSON.parse(cached));
         setLoading(false);
      }

      fetchRequests();
      
      // Real-time updates for payment requests
      const subscription = supabase
         .channel('payment_admin')
         .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_requests' }, () => {
            fetchRequests();
         })
         .subscribe();

      return () => {
         subscription.unsubscribe();
      };
   }, []);

   const handleApprove = async (request: any) => {
      try {
         // 1. Approve Payment
         const { error: updateError } = await supabase
            .from('payment_requests')
            .update({ status: 'approved' })
            .eq('id', request.id);

         if (updateError) throw updateError;

          // 2. Automated Enrollment
          const { error: enrollError } = await supabase
             .from('enrollments')
             .upsert({
                userId: request.userId,
                courseId: request.courseId
             }, { 
                onConflict: 'userId,courseId'
             });

         if (enrollError && enrollError.code !== '23505') throw enrollError;
         
         // 3. Sync Logic: Dispatches global event to refresh enrollment counts
         window.dispatchEvent(new CustomEvent('itqan:enrollment-updated'));
         
         // Force immediate re-fetch of requests to reflect status change
         await fetchRequests();

         if (request.user?.email) {
            sendRealEmail(request.user.email, request.course?.title || 'Course');
         }

         try {
            const channel = supabase.channel('enrollment-updates');
            channel.subscribe(async (status) => {
               if (status === 'SUBSCRIBED') {
                   const response = await channel.send({
                      type: 'broadcast',
                      event: 'enrollment-approved',
                      payload: { userId: request.userId, courseId: request.courseId }
                   });
                  setTimeout(() => supabase.removeChannel(channel), 2000);
               }
            });
         } catch (e) {}

         confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10B981', '#34D399'] });
         addNotification(`Enrollment Successful! Course opened for ${request.user?.name || 'Student'}`, 'success');
         fetchRequests();
      } catch (err: any) {
         console.error('Approval failed:', err);
         addNotification(`Approval Error: ${err.message || 'Database connection lost'}`, 'error');
         alert(`SCHEMA ERROR: ${err.details || err.message}`);
      }
   };


   const handleCancelApproval = async (request: any) => {
      if (!confirm(`Are you sure you want to cancel the approval for ${request.user?.name}? This will lock the course again.`)) {
         return;
      }

      try {
         console.log('🔄 Starting Cancel Approval Process...');
         console.log('Request data:', { userId: request.userId, courseId: request.courseId });

         // 1. First, check if enrollment exists
         const { data: existingEnrollment, error: checkError } = await supabase
            .from('enrollments')
            .select('*')
            .eq('userId', request.userId)
            .eq('courseId', request.courseId)
            .maybeSingle();

         if (checkError) throw checkError;

         if (existingEnrollment) {
            // 2. Delete enrollment record to lock the course
            const { error: deleteError } = await supabase
               .from('enrollments')
               .delete()
               .eq('userId', request.userId)
               .eq('courseId', request.courseId);

            if (deleteError) throw deleteError;
         }

         // 4. Update payment status to pending
         const { error: updateError } = await supabase
            .from('payment_requests')
            .update({ status: 'pending' })
            .eq('id', request.id);

         if (updateError) {
            console.error('❌ Status update error:', updateError);
            throw new Error(`Failed to update payment status: ${updateError.message}`);
         }

         console.log('✅ Payment status updated to pending');

         // 5. Instantly update local state for immediate UI refresh
         setRequests(prevRequests => 
            prevRequests.map(req => 
               req.id === request.id 
                  ? { ...req, status: 'pending' } 
                  : req
          )
         );

         console.log('✅ Local state updated - UI should refresh');

         // 6. Broadcast enrollment cancellation to student's client for real-time sync
         try {
            console.log('📡 Initializing enrollment-cancelled broadcast...');
            const channel = supabase.channel('enrollment-updates', {
               config: {
                  broadcast: { ack: true }
               }
            });
            
            channel.subscribe(async (status) => {
               if (status === 'SUBSCRIBED') {
                  const response = await channel.send({
                     type: 'broadcast',
                     event: 'enrollment-cancelled',
                      payload: {
                         userId: request.userId,
                         courseId: request.courseId,
                         courseName: request.course?.title,
                         timestamp: new Date().toISOString()
                      }
                  });
                  console.log('📡 Cancellation broadcast status:', response);
                  
                  // Cleanup after sending
                  setTimeout(() => {
                     supabase.removeChannel(channel);
                     console.log('📡 Channel removed after successful broadcast');
                  }, 2000);
               }
            });
         } catch (broadcastErr) {
            console.warn('⚠️ Broadcast failed (non-critical):', broadcastErr);
            // Don't throw - broadcast failure shouldn't stop the process
         }

          // 7. Notify Student
          const studentNotifKey = `itqan_notifications_${request.userId}`;
         const studentNotifs = JSON.parse(localStorage.getItem(studentNotifKey) || '[]');
         studentNotifs.unshift({
            id: Date.now(),
            message: `⚠️ Your approval for "${request.course?.title}" has been cancelled. The course is now locked.`,
            type: 'warning',
            timestamp: new Date().toISOString()
         });
         localStorage.setItem(studentNotifKey, JSON.stringify(studentNotifs.slice(0, 50)));

         window.dispatchEvent(new CustomEvent('itqan:enrollment-updated'));
          addNotification('Access revoked successfully', 'success');
          fetchRequests();
       } catch (err: any) {
          console.error('Revoke failed:', err);
          addNotification(`Sync Failure: ${err.message}`, 'error');
          alert(`DATABASE ERROR: ${err.details || err.message}`);
       }
    };

    const handleHardDelete = async (request: any) => {
       if (!confirm(`⚠️ HARD DELETE: This will permanently remove the payment request and course access for ${request.user?.name}. Are you sure?`)) return;

       try {
          // 1. Remove enrollment first
          await supabase.from('enrollments').delete().eq('userId', request.userId).eq('courseId', request.courseId);
          
          // 2. Remove payment request
          const { error } = await supabase.from('payment_requests').delete().eq('id', request.id);
          
          if (error) throw error;

          addNotification('Record completely purged', 'info');
          fetchRequests();
       } catch (err: any) {
          addNotification(`Delete Error: ${err.message}`, 'error');
       }
    };


   const handleReject = async (id: string) => {
      const { error } = await supabase
         .from('payment_requests')
         .update({ status: 'rejected' })
         .eq('id', id);
      
      if (!error) addNotification('Payment Rejected', 'info');
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Payment Verification</h2>
               <p className="text-slate-500 text-sm">Approve student enrollments manually.</p>
            </div>
            <button 
               onClick={fetchRequests}
               className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-blue-600 hover:shadow-lg transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
               disabled={loading}
            >
               <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
               {loading ? 'Refreshing...' : 'Refresh Requests'}
            </button>
         </div>
         
         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
               <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                     <tr>
                        <th className={`px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>Student</th>
                        <th className={`px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>Course</th>
                        <th className={`px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>Amount</th>
                        <th className={`px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>Receipt</th>
                        <th className={`px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>Status</th>
                        <th className="px-8 py-5"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {loading ? (
                        <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-bold">Fetching payments...</td></tr>
                     ) : requests.length === 0 ? (
                        <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-bold">No payment requests found</td></tr>
                      ) : requests.map((req) => {
                         // Debug logging to check status
                         console.log('Payment Request:', {
                            id: req.id,
                            status: req.status,
                            statusType: typeof req.status,
                            student: req.user?.name,
                            course: req.course?.title
                         });
                         
                         return (
                         <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center text-blue-600 font-bold">
                                     {req.user?.name?.[0] || 'S'}
                                  </div>
                                  <div>
                                     <p className="font-bold text-slate-800">{req.user?.name || 'Student'}</p>
                                     <p className="text-xs text-slate-400">{req.user?.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className="text-sm font-bold text-slate-700">{req.course?.title}</span>
                            </td>
                            <td className="px-8 py-6">
                               <span className="text-sm font-black text-[#2563EB]">${req.amount}</span>
                            </td>
                             <td className="px-8 py-6">
                                <button 
                                   onClick={() => setPreviewImage(req.receipt_url)}
                                   className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all shadow-sm"
                                >
                                   <img src={req.receipt_url} className="w-full h-full object-cover" alt="Proof" />
                                </button>
                             </td>
                            <td className="px-8 py-6">
                               <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                  req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                  req.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                  'bg-blue-100 text-blue-700 animate-pulse'
                               }`}>
                                  {req.status}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               {req.status === 'pending' ? (
                                   <div className="flex gap-2 justify-end">
                                     <button 
                                        onClick={() => handleHardDelete(req)}
                                        title="Hard Delete Record"
                                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                     >
                                        <Trash2 className="w-5 h-5" />
                                     </button>
                                     <button 
                                        onClick={() => handleReject(req.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                     >
                                        <X className="w-5 h-5" />
                                     </button>
                                     <button 
                                        onClick={() => handleApprove(req)}
                                        className="px-6 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-black tracking-widest uppercase hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                     >
                                        Approve
                                     </button>
                                  </div>
                               ) : req.status === 'approved' ? (
                                  <div className="flex gap-2 justify-end">
                                     <button 
                                        onClick={() => handleCancelApproval(req)}
                                        className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-black tracking-widest uppercase hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
                                     >
                                        Cancel Approval
                                     </button>
                                  </div>
                               ) : null}
                            </td>
                         </tr>
                         );
                      })}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Receipt Preview Modal */}
         <AnimatePresence>
            {previewImage && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setPreviewImage(null)}
                     className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                  />
                  <motion.div 
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.9, opacity: 0 }}
                     className="relative max-w-4xl w-full max-h-full bg-white rounded-3xl overflow-hidden shadow-2xl"
                  >
                     <img src={previewImage} className="w-full h-auto max-h-[80vh] object-contain" alt="Receipt Preview" />
                     <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-500">Receipt Verification</span>
                        <button 
                           onClick={() => setPreviewImage(null)}
                           className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                        >
                           Close Preview
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
};

const AdminSettingsView = ({ userData, onUpload, uploadState }: { userData: any, onUpload: (e: any, type: 'profile' | 'cover') => void, uploadState: any }) => {
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

// Purple-themed Luxury Scrollbar Styles
const style = document.createElement('style');
style.textContent = `
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #9333ea;
    border-radius: 10px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #7e22ce;
  }
`;
document.head.appendChild(style);

export default function AdminDashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [uploadState, setUploadState] = useState<{ loading: boolean; progress: number; type: 'profile' | 'cover' | null }>({
    loading: false,
    progress: 0,
    type: null
  });

  useEffect(() => {
    const fetchCourseName = async () => {
      if (!selectedCourseId) {
        setSelectedCourseName(null);
        return;
      }
      const { data } = await supabase.from('courses').select('title').eq('id', selectedCourseId).single();
      if (data) setSelectedCourseName(data.title);
    };
    fetchCourseName();
  }, [selectedCourseId]);

  useEffect(() => {
    const handleClearSearch = () => setSearchQuery('');
    window.addEventListener('itqan:clear-search', handleClearSearch);
    return () => window.removeEventListener('itqan:clear-search', handleClearSearch);
  }, []);

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

  const fetchAdminNotifications = async () => {
    try {
      // Strictly select confirmed columns only
      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, message, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
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

    fetchAdminNotifications();

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#7C3AED']
    });
    
    // Crucial: allow UI to render after auth and data fetch
    setIsLoading(false);
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
            <div className={`relative group transition-all duration-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
               <Search className={`w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 transition-all duration-500 group-focus-within:text-[#2563EB] ${isRTL ? 'right-5' : 'left-5'}`} />
               <input 
                  type="text" 
                  placeholder={isRTL ? "ابحث عن أي شيء..." : t('search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-64 bg-white border border-slate-100 rounded-full py-3.5 ${isRTL ? 'pr-14 pl-6' : 'pl-14 pr-6'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all hover:w-80 focus:w-96 shadow-sm hover:shadow-md focus:shadow-xl focus:scale-[1.02] active:scale-[0.98] font-medium text-sm`}
               />
               <AnimatePresence>
                  {searchQuery && (
                     <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => setSearchQuery('')}
                        className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm`}
                     >
                        <X className="w-3 h-3" />
                     </motion.button>
                  )}
               </AnimatePresence>
            </div>
            
             <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#F59E0B] hover:shadow-lg transition-all relative ${showNotifications ? 'text-[#F59E0B] border-[#F59E0B]/30' : ''}`}
                >
                   <Bell className="w-5 h-5" />
                   {notifications.length > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                   )}
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
                            <h3 className="font-bold text-slate-800">Student Requests</h3>
                            <button 
                              onClick={async () => {
                                 const { error } = await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                                 if (!error) setNotifications([]);
                                 setShowNotifications(false);
                              }}
                              className="text-[10px] uppercase tracking-widest text-[#2563EB] font-black"
                            >
                               Clear
                            </button>
                         </div>
                         <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                            {notifications.length === 0 ? (
                               <p className="text-center text-sm text-slate-400 py-4">No new requests</p>
                            ) : (
                               notifications.map((notif, i) => (
                                  <motion.div 
                                     key={notif.id || i}
                                     initial={{ opacity: 0, x: -20 }}
                                     animate={{ opacity: 1, x: 0 }}
                                     transition={{ delay: i * 0.1 }}
                                     className="flex gap-3 hover:bg-slate-50 p-3 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                                  >
                                     <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-[#2563EB]" />
                                     <div>
                                        <p className="text-xs font-bold text-slate-700 leading-tight">{notif.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                                           {notif.created_at ? new Date(notif.created_at).toLocaleString() : ''}
                                        </p>
                                     </div>
                                  </motion.div>
                               ))
                            )}
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>
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
               <OverviewStats />

               <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[400px]">
                     <div className="flex justify-between items-center mb-8">
                         <div>
                            <h3 className="font-bold text-lg text-slate-800">
                               Growth Analysis{selectedCourseName ? `: ${selectedCourseName}` : ''}
                            </h3>
                            <p className="text-sm text-slate-400">Student enrollment & revenue trends</p>
                         </div>
                        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm font-medium text-slate-600 outline-none">
                           <option>Last 30 Days</option>
                           <option>This Year</option>
                        </select>
                     </div>
                     <div className="h-72 w-full">
                         <AnalyticsChart isRTL={isRTL} selectedCourseId={selectedCourseId} />
                     </div>
                  </div>
                  
                   <ActiveCourses 
                      t={t} 
                      selectedCourseId={selectedCourseId}
                      onSelectCourse={setSelectedCourseId}
                      onViewAnalytics={(courseId) => {
                         setSelectedCourseId(courseId);
                         setActiveTab('courses');
                      }}
                   />
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

                   <CourseList 
                      searchQuery={searchQuery} 
                      isRTL={isRTL} 
                      onSelectCourse={setSelectedCourseId}
                      onSetActiveTab={setActiveTab}
                      onEditCourse={(c) => {
                         setEditingCourse(c);
                         setShowUpload(true);
                      }}
                   />
                </div>
             )}

             {activeTab === 'course-editor' && (
                <div className="space-y-6">
                   <div className="flex items-center gap-4 mb-8">
                      <button 
                         onClick={() => setActiveTab('courses')}
                         className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-[#2563EB] transition-all shadow-sm"
                      >
                         <X className="w-5 h-5 rotate-90" />
                      </button>
                      <div>
                         <h2 className="text-2xl font-bold text-slate-800">Course Editor</h2>
                         <p className="text-slate-500 text-sm">Now editing: <span className="text-[#2563EB] font-bold">{selectedCourseName || 'Selected Course'}</span></p>
                      </div>
                   </div>

                   <LessonManager 
                     courseId={selectedCourseId} 
                     onBack={() => setActiveTab('courses')} 
                   />
                </div>
             )}

            {activeTab === 'students' && <StudentDirectory searchQuery={searchQuery} />}
            {activeTab === 'payments' && <AdminPaymentRequestsView />}
            {activeTab === 'settings' && <AdminSettingsView userData={userData} onUpload={handleFileChange} uploadState={uploadState} />}

        </div>
      </main>

      <AnimatePresence>
         {showUpload && (
            <CourseUploadModal 
               course={editingCourse}
               onClose={() => {
                  setShowUpload(false);
                  setEditingCourse(null);
               }} 
               onSuccess={() => {
                  window.location.reload(); 
               }} 
            />
         )}
      </AnimatePresence>
    </div>
  );
}
