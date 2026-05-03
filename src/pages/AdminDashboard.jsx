import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Briefcase, Flag, BadgeCheck, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import AdminVerifications from "../components/admin/AdminVerifications";
import AdminReports from "../components/admin/AdminReports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { t, rtl } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ workers: 0, jobs: 0, pendingVerifications: 0, reports: 0 });
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    if (u.role !== 'admin' && u.email !== 'mraiwamahmod@gmail.com') {
      navigate('/');
      return;
    }

    const [workers, jobs, reports] = await Promise.all([
      base44.entities.WorkerProfile.list('-created_date', 1000),
      base44.entities.JobPost.list('-created_date', 1000),
      base44.entities.Report.filter({ status: 'pending' }, '-created_date', 100),
    ]);

    setStats({
      workers: workers.length,
      jobs: jobs.length,
      pendingVerifications: workers.filter(w => w.verification_status === 'pending').length,
      reports: reports.length,
    });
  };

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      <div className="sticky top-0 z-40 bg-card border-b border-border px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">{t.admin_dashboard}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: t.total_workers, value: stats.workers, icon: Users, color: "bg-blue-50 text-blue-600" },
            { label: t.total_jobs, value: stats.jobs, icon: Briefcase, color: "bg-green-50 text-green-600" },
            { label: t.pending_verifications, value: stats.pendingVerifications, icon: BadgeCheck, color: "bg-yellow-50 text-yellow-600" },
            { label: t.reports, value: stats.reports, icon: Flag, color: "bg-red-50 text-red-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl border border-border p-4">
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="verifications">
          <TabsList className="w-full rounded-xl">
            <TabsTrigger value="verifications" className="flex-1 rounded-lg text-xs">
              {t.pending_verifications}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 rounded-lg text-xs">
              {t.reports}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="verifications" className="mt-4">
            <AdminVerifications />
          </TabsContent>
          <TabsContent value="reports" className="mt-4">
            <AdminReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}