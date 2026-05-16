import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ChevronRight, Plus, AlertCircle, Store } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import CategoryIcon from "../components/common/CategoryIcon";
import WorkerCard from "../components/cards/WorkerCard";
import JobCard from "../components/cards/JobCard";
import { CATEGORIES, CITIES_AR } from "../lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import usePullToRefresh from "../hooks/usePullToRefresh";

export default function Home() {
  const { t, lang, rtl } = useLanguage();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadAll();
  }, []);

  const loadAll = useCallback(async () => {
    const [w, j] = await Promise.all([
      base44.entities.WorkerProfile.list('-created_date', 6).catch(() => []),
      base44.entities.JobPost.filter({ status: 'open' }, '-created_date', 4).catch(() => []),
    ]);
    setWorkers(w);
    setJobs(j);
  }, []);

  const { refreshing } = usePullToRefresh(loadAll);

  const featuredWorkers = workers.filter(w => w.verification_status === 'verified' || w.is_featured).slice(0, 4);
  const displayWorkers = featuredWorkers.length > 0 ? featuredWorkers : workers.slice(0, 4);

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {refreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-full px-4 py-2 flex items-center gap-2 shadow-lg"
          >
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-xs font-medium">Refreshing...</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-emerald-700 to-teal-800 text-primary-foreground px-5 pt-12 pb-10 rounded-b-[2.5rem] shadow-xl">
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-16 -right-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full bg-black/10" />
        <div className="max-w-lg mx-auto relative z-10">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-primary-foreground/60 text-xs tracking-widest uppercase font-medium">{t.welcome} 👋</p>
              <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">{t.app_name}</h1>
              <p className="text-primary-foreground/60 text-xs mt-0.5">{t.app_tagline}</p>
            </div>
            <Link to="/settings" className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <span className="text-sm font-bold">{lang === 'ar' ? 'EN' : 'ع'}</span>
            </Link>
          </div>

          {/* Search */}
          <div className="relative mt-5">
            <Search className="absolute top-3.5 left-4 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.search + "..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/workers?search=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/95 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-2">
        {/* Warning Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-yellow-50 border border-yellow-200 mb-6 mt-4"
        >
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <p className="text-xs text-yellow-700">{t.warning_price}</p>
        </motion.div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground">{t.categories}</h2>
            <Link to="/workers" className="text-xs text-primary font-medium flex items-center gap-0.5">
              {t.view_all}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide" style={{scrollbarWidth:'none'}}>
            {CATEGORIES.slice(0, 12).map((cat) => (
              <Link
                key={cat}
                to={`/workers?category=${cat}`}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className="w-14 h-14 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <CategoryIcon category={cat} size="w-14 h-14" iconSize="w-7 h-7" />
                </div>
                <span className="text-[10px] font-medium text-foreground text-center leading-tight w-14">
                  {t[cat]}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            to="/create-job"
            className="relative overflow-hidden flex flex-col gap-2 p-4 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">{t.create_job}</p>
              <p className="text-[10px] text-primary-foreground/70">{t.customer_desc}</p>
            </div>
          </Link>
          <Link
            to="/create-worker-profile"
            className="relative overflow-hidden flex flex-col gap-2 p-4 rounded-2xl bg-gradient-to-br from-accent to-red-600 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">{t.create_profile}</p>
              <p className="text-[10px] text-white/70">{t.worker_desc}</p>
            </div>
          </Link>
        </div>

        {/* Featured Workers */}
        {displayWorkers.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground">{t.browse_workers}</h2>
              <Link to="/workers" className="text-xs text-primary font-medium flex items-center gap-0.5">
                {t.view_all}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {displayWorkers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Jobs - show only 2 as preview */}
        {jobs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground">{t.browse_jobs}</h2>
              <Link to="/jobs" className="text-xs text-primary font-medium flex items-center gap-0.5">
                {t.view_all}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {jobs.slice(0, 2).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {jobs.length > 2 && (
              <Link to="/jobs" className="block mt-2 text-center text-xs text-primary font-medium py-2 rounded-xl border border-primary/20 bg-primary/5">
                {t.view_all} ({jobs.length})
              </Link>
            )}
          </div>
        )}

        {/* Businesses CTA */}
        <Link to="/businesses" className="block mb-6">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.browse_businesses}</p>
              <p className="text-[10px] text-muted-foreground">{t.business_desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </div>
        </Link>
      </div>
    </div>
  );
}