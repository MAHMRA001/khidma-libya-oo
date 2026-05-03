import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Briefcase, Star, ChevronRight, LogOut, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import VerificationBadge from "../components/common/VerificationBadge";
import WorkerCard from "../components/cards/WorkerCard";
import JobCard from "../components/cards/JobCard";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { t, rtl } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    
    const profiles = await base44.entities.WorkerProfile.filter({ user_email: u.email });
    if (profiles.length > 0) setWorkerProfile(profiles[0]);
    
    const jobs = await base44.entities.JobPost.filter({ poster_email: u.email }, '-created_date', 10);
    setMyJobs(jobs);
    setLoading(false);
  };

  const handleLogout = () => {
    base44.auth.logout('/welcome');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      <div className="bg-primary text-primary-foreground px-5 pt-12 pb-8 rounded-b-[2rem]">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold mb-4">{t.profile}</h1>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              {workerProfile?.profile_photo ? (
                <img src={workerProfile.profile_photo} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">{user?.full_name}</h2>
              <p className="text-primary-foreground/70 text-sm">{user?.email}</p>
              {user?.account_type && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {t[user.account_type]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        {/* Worker Profile Section */}
        {workerProfile ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">{t.my_profile}</h2>
              <VerificationBadge status={workerProfile.verification_status} />
            </div>
            <WorkerCard worker={workerProfile} />
            <Link to="/create-worker-profile">
              <Button variant="outline" className="w-full mt-3 rounded-xl">{t.edit_profile}</Button>
            </Link>
          </div>
        ) : (
          <Link to="/create-worker-profile" className="block mb-6">
            <div className="p-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{t.create_profile}</p>
                <p className="text-xs text-muted-foreground">{t.worker_desc}</p>
              </div>
            </div>
          </Link>
        )}

        {/* My Jobs */}
        <div className="mb-6">
          <h2 className="font-bold mb-3">{t.my_jobs}</h2>
          {myJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {rtl ? 'ليس لديك أي منشورات بعد.' : "You don't have any posts yet."}
            </p>
          ) : (
            <div className="space-y-3">
              {myJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="space-y-2 mb-6">
          <Link to="/settings" className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-secondary transition-colors">
            <span className="text-sm font-medium">{t.settings}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>

        <Button variant="ghost" onClick={handleLogout} className="w-full rounded-xl text-destructive hover:text-destructive gap-2">
          <LogOut className="w-4 h-4" />
          {t.logout}
        </Button>
      </div>
    </div>
  );
}