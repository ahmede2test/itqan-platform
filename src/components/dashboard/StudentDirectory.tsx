import { useState, useEffect } from 'react';
import { Users, Mail, Clock, ChevronRight, AlertCircle, Search, Loader2, X, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
  enrollments: { courseId: string; courses: { title: string } }[];
}

interface StudentDirectoryProps {
  searchQuery: string;
}

export const StudentDirectory = ({ searchQuery }: StudentDirectoryProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .order('createdAt', { ascending: false });

      if (userError) throw userError;

      const { data: enrolls, error: enrollError } = await supabase
        .from('enrollments')
        .select('userId, courseId, courses(title)');

      if (enrollError) throw enrollError;

      const mappedStudents = users.map(user => ({
        ...user,
        enrollments: enrolls?.filter(e => e.userId === user.id) || []
      }));

      setStudents(mappedStudents);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      setErrorStatus(error.message || 'Database Synchronization Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

    // Listen for enrollment updates to refresh student list mapping
    const handleSync = () => fetchStudents();
    window.addEventListener('itqan:enrollment-updated', handleSync);
    return () => window.removeEventListener('itqan:enrollment-updated', handleSync);
  }, []);

  // Performance: Dynamic search indicator trigger
  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Arabic-Native Search Normalization Logic
  const normalize = (text: string) => {
    if (!text) return "";
    return text.trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "") // Remove common accents
      .replace(/[أإآ]/g, 'ا') // Normalize Arabic Alef
      .replace(/ة/g, 'ه') // Normalize Taa Marbuta
      .replace(/ى/g, 'ي'); // Normalize Alef Maqsura
  };

  const filteredStudents = students.filter(s => {
    const query = normalize(searchQuery);
    return normalize(s.name).includes(query) || normalize(s.email).includes(query);
  });

  const isActive = (updatedAt: string) => {
    if (!updatedAt) return false;
    const lastSeen = new Date(updatedAt);
    const now = new Date();
    const diff = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24);
    return diff < 7;
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-100 rounded" />
            <div className="h-3 w-40 bg-slate-50 rounded" />
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-slate-100 rounded-lg" />
          <div className="h-6 w-16 bg-slate-50 rounded-lg" />
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <div className="h-4 w-12 bg-slate-100 rounded ml-auto" />
      </td>
    </tr>
  );

  if (errorStatus) {
    return (
      <div className="bg-red-50 border border-red-100 p-12 rounded-[2.5rem] text-center max-w-2xl mx-auto shadow-xl">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-6" />
        <h3 className="text-xl font-black text-red-800 mb-3 uppercase">Sync Error</h3>
        <p className="text-red-600 mb-8">{errorStatus}</p>
        <button onClick={fetchStudents} className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase shadow-lg">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Directory Header with Dynamic Indicator */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm gap-6 overflow-hidden relative">
        <div className="flex items-center gap-5 z-10">
          <div className="w-14 h-14 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Student Directory</h2>
            <div className="flex items-center gap-2 mt-0.5">
               <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.1em]">
                 {!searchQuery 
                    ? (loading ? 'Analyzing...' : `${students.length} TOTAL USERS REGISTERED`)
                    : (isRTL ? `تم العثور على ${filteredStudents.length} نتائج` : `Found ${filteredStudents.length} matches`)}
               </p>
               {isSearching && (
                 <motion.div 
                   initial={{ opacity: 0, x: -10 }} 
                   animate={{ opacity: 1, x: 0 }}
                   className="flex items-center gap-2 px-3 py-1 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/30"
                 >
                   <Loader2 className="w-3 h-3 animate-spin" />
                   {isRTL ? "جاري البحث في قاعدة البيانات..." : "Searching Database..."}
                 </motion.div>
               )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 z-10 w-full md:w-auto">
          <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
               {loading ? 'Establishing Sync...' : 'Real-time Linked'}
             </span>
          </div>
        </div>

        {/* Animated Background Pulse for Searching */}
        <AnimatePresence>
           {isSearching && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.05 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-blue-500 pointer-events-none"
              />
           )}
        </AnimatePresence>
      </div>

      {/* Modern Table Layout with Skeleton Loading */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100 italic">
              <tr>
                <th className={`px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>Student Profile</th>
                <th className={`px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>Enrolled Content</th>
                <th className={`px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>Live Status</th>
                <th className={`px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>History</th>
                <th className="px-10 py-7"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout" initial={false}>
                {loading || isSearching ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => (
                    <motion.tr 
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="group hover:bg-slate-50/70 transition-all duration-300"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-[2rem] bg-gradient-to-tr from-slate-100 to-white p-[2px] shadow-sm ring-1 ring-slate-100 group-hover:scale-110 transition-transform duration-500">
                              <div className="w-full h-full rounded-[1.95rem] bg-white overflow-hidden shadow-inner flex items-center justify-center">
                                {student.profileImage ? (
                                  <img src={student.profileImage} className="w-full h-full object-cover" alt="Student" />
                                ) : (
                                  <span className="text-slate-300 font-black text-xl">{student.name?.[0] || 'U'}</span>
                                )}
                              </div>
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm tracking-tight group-hover:text-blue-600 transition-colors uppercase">{student.name || 'Anonymous'}</p>
                            <p className="text-[10px] text-slate-400 font-black flex items-center gap-2 uppercase tracking-tighter mt-0.5">
                              <Mail className="w-3 h-3 text-blue-400/50" />
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-wrap gap-2">
                          {student.enrollments.map((enr, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white text-[#2563EB] text-[9px] font-black uppercase tracking-widest rounded-xl border border-blue-100 shadow-sm hover:border-blue-500 transition-all">
                              {enr.courses?.title}
                            </span>
                          ))}
                          {student.enrollments.length === 0 && <span className="text-[10px] font-black text-slate-300 italic uppercase">Observation Phase</span>}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                         {isActive(student.updatedAt) ? (
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100">
                               <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Active Now</span>
                            </div>
                         ) : (
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full">
                               <div className="w-2 h-2 rounded-full bg-slate-200" />
                               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Dormant</span>
                            </div>
                         )}
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2 text-slate-500 font-black text-[11px] uppercase tracking-tighter">
                          <Clock className="w-4 h-4 text-slate-300" />
                          {new Date(student.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:shadow-xl rounded-2xl transition-all">
                            <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                         </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <td colSpan={5} className="px-10 py-40 text-center">
                       <div className="max-w-md mx-auto space-y-8">
                          <div className="relative inline-block">
                             <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner border border-slate-100 group-hover:scale-110 transition-transform duration-700">
                                <Search className="w-12 h-12 text-slate-200" />
                             </div>
                             <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-slate-50">
                                <X className="w-5 h-5 text-red-400" />
                             </div>
                          </div>
                          <div>
                             <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">
                               {isRTL ? "لا توجد نتائج مطابقة" : "No results found"}
                             </h3>
                             <p className="text-sm text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
                               {isRTL 
                                 ? "لا توجد نتائج مطابقة لبحثك. جرب كلمات أخرى."
                                 : "Try searching with different keywords to find your students."}
                             </p>
                          </div>
                          <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('itqan:clear-search'))}
                            className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-2xl active:scale-95 flex items-center gap-3 mx-auto"
                          >
                             <Database className="w-4 h-4" />
                             Reset Data Query
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
