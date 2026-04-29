import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../../hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminReports() {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const data = await base44.entities.Report.filter({ status: 'pending' }, '-created_date', 50);
    setReports(data);
    setLoading(false);
  };

  const handleResolve = async (id) => {
    await base44.entities.Report.update(id, { status: 'resolved' });
    toast.success(t.success);
    loadReports();
  };

  const handleDelete = async (id) => {
    await base44.entities.Report.delete(id);
    toast.success(t.success);
    loadReports();
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (reports.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-8">{t.no_results}</p>;
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div key={report.id} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
              {t[report.reason] || report.reason}
            </span>
            <span className="text-xs text-muted-foreground">{report.reported_type}</span>
          </div>
          <p className="text-sm font-medium mb-1">{report.reported_name || report.reported_id}</p>
          {report.description && (
            <p className="text-xs text-muted-foreground mb-3">{report.description}</p>
          )}
          <p className="text-xs text-muted-foreground mb-3">
            {t.report}: {report.reporter_email}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleResolve(report.id)} className="flex-1 rounded-lg text-xs">
              {t.approve}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(report.id)} className="flex-1 rounded-lg text-xs">
              {t.delete}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}