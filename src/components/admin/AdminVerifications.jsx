import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../../hooks/useLanguage";
import VerificationBadge from "../common/VerificationBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

export default function AdminVerifications() {
  const { t, lang } = useLanguage();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectOpen, setRejectOpen] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    const data = await base44.entities.WorkerProfile.filter({ verification_status: 'pending' }, '-created_date', 50);
    setWorkers(data);
    setLoading(false);
  };

  const handleVerify = async (id) => {
    await base44.entities.WorkerProfile.update(id, { verification_status: 'verified' });
    toast.success(t.success);
    loadWorkers();
  };

  const handleReject = async (id) => {
    await base44.entities.WorkerProfile.update(id, { 
      verification_status: 'rejected',
      rejection_reason: rejectReason 
    });
    setRejectOpen(null);
    setRejectReason("");
    toast.success(t.success);
    loadWorkers();
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (workers.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-8">{t.no_results}</p>;
  }

  return (
    <div className="space-y-3">
      {workers.map((worker) => (
        <div key={worker.id} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            {worker.profile_photo ? (
              <img src={worker.profile_photo} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">{worker.full_name?.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-sm">{worker.full_name}</p>
              <p className="text-xs text-muted-foreground">{worker.city} · {t[worker.category]}</p>
            </div>
            <VerificationBadge status={worker.verification_status} />
          </div>

          {/* Documents */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {worker.id_document && (
              <a href={worker.id_document} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary">
                <ExternalLink className="w-3 h-3" /> {t.id_document}
              </a>
            )}
            {worker.selfie_photo && (
              <a href={worker.selfie_photo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary">
                <ExternalLink className="w-3 h-3" /> {t.selfie}
              </a>
            )}
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleVerify(worker.id)} className="flex-1 rounded-lg text-xs">
              {t.verify}
            </Button>
            <Dialog open={rejectOpen === worker.id} onOpenChange={(o) => setRejectOpen(o ? worker.id : null)}>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive" className="flex-1 rounded-lg text-xs">
                  {t.reject}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t.reject}</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t.rejection_reason}
                    rows={3}
                  />
                  <Button onClick={() => handleReject(worker.id)} variant="destructive" className="w-full rounded-xl">
                    {t.reject}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ))}
    </div>
  );
}