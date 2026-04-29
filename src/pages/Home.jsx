import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ChevronRight, Plus, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import CategoryIcon from "../components/common/CategoryIcon";
import WorkerCard from "../components/cards/WorkerCard";
import JobCard from "../components/cards/JobCard";
import { CATEGORIES, CITIES_AR } from "../lib/i18n";
import { motion } from "framer-motion";

export default function Home() {
  const { t, lang, rtl } = useLanguage();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.WorkerProfile.list('-created_date', 6).then(setWorkers).catch(() => {});
    base44.entities.JobPost.filter({ status: 'open' }, '-created_date', 4).then(setJobs).catch(() => {});
  }, []);

  const featuredWorkers = workers.filter(w => w.verification_status === 'verified' || w.is_featured).slice(0, 4);
  const displayWorkers = featuredWorkers.length > 0 ? featuredWorkers : workers.slice(0, 4);

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-5 pt-12 pb-8 rounded-b-[2rem]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary-foreground/70 text-sm">{t.welcome} 👋</p>
              <h1 className="text-xl font-bold">{t.app_name}</h1>
            </div>
            <Link to="/settings" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-sm font-bold">{lang === 'ar' ? 'EN' : 'ع'}</span>
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
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
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
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
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.slice(0, 8).map((cat) => (
              <Link
                key={cat}
                to={`/workers?category=${cat}`}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <CategoryIcon category={cat} size="w-12 h-12" iconSize="w-6 h-6" />
                <span className="text-[10px] font-medium text-foreground text-center leading-tight">
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
            className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.create_job}</p>
              <p className="text-[10px] text-muted-foreground">{t.customer_desc}</p>
            </div>
          </Link>
          <Link
            to="/create-worker-profile"
            className="flex items-center gap-3 p-4 rounded-2xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.create_profile}</p>
              <p className="text-[10px] text-muted-foreground">{t.worker_desc}</p>
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

        {/* Recent Jobs */}
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
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}