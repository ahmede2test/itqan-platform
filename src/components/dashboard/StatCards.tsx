import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

export const StatCard = ({ label, value, change, color }: { label: string, value: string, change: string, color: string }) => (
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

export const OverviewStats = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalStudents: '0',
    activeCourses: '0',
    revenue: '$0',
    pending: '0'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Total Students from users table as requested
        const { count: studentCount, error: studentError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        // 2. Active Courses (using exact count from courses table)
        const { count: courseCount, error: courseError } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true });

        if (studentError) console.error('Error fetching students:', studentError);
        if (courseError) console.error('Error fetching courses:', courseError);

        setStats(prev => ({
          ...prev,
          totalStudents: (studentCount || 0).toLocaleString(),
          activeCourses: (courseCount || 0).toLocaleString()
        }));
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard label={t('total_students')} value={stats.totalStudents} change="+0%" color="from-blue-500 to-cyan-500" />
      <StatCard label={t('active_courses')} value={stats.activeCourses} change="+0%" color="from-purple-500 to-pink-500" />
      <StatCard label={t('monthly_revenue')} value={stats.revenue} change="+0%" color="from-green-500 to-emerald-500" />
      <StatCard label={t('pending_assignments')} value={stats.pending} change="+0%" color="from-orange-500 to-red-500" />
    </div>
  );
};

