import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Phone, MessageCircle, AlertTriangle, Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import CategoryIcon from "../components/common/CategoryIcon";
import { CITIES_AR } from "../lib/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import moment from "moment";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang, rtl } = useLanguage();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("fake_profile");
  const [reportDesc, setReportDesc] = useState("");

  useEffect(() => {
    base44.entities.JobPost.get(id).then(j => { setJob(j); setLoading(false); });
  }, [id]);

  const submitReport = async () => {
    const user = await base44.auth.me();
    await base44.entities.Report.create({
      reported_type: 'job_post',
      reported_id: id,
      reported_name: job?.title,
      reporter_email: user?.email,
      reason: reportReason,
      description: reportDesc,
    });
    setReportOpen(false);
    toast.success(t.success);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) return null;
  const cityLabel = lang === 'ar' ? (CITIES_AR[job.city] || job.city) : job.city;

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      <div className="sticky top-0 z-40 bg-card border-b border-border px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg truncate">{lang === 'ar' && job.title_ar ? job.title_ar : job.title}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        <div className="bg-card rounded-2xl border border-border p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <CategoryIcon category={job.category} size="w-12 h-12" iconSize="w-6 h-6" />
            <div>
              <h2 className="font-bold text-lg">{lang === 'ar' && job.title_ar ? job.title_ar : job.title}</h2>
              <span className="text-sm text-muted-foreground">{t[job.category]}</span>
            </div>
            {job.urgency === 'urgent' && (
              <span className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                <AlertTriangle className="w-3 h-3" /> {t.urgent}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {cityLabel}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {moment(job.created_date).fromNow()}</span>
          </div>

          {job.budget && (
            <div className="mb-4 p-3 rounded-xl bg-primary/5">
              <p className="text-xs text-muted-foreground">{t.budget}</p>
              <p className="text-xl font-bold text-primary">{job.budget} {t.lyd}</p>
            </div>
          )}

          <p className="text-sm text-foreground leading-relaxed mb-4">
            {lang === 'ar' && job.description_ar ? job.description_ar : job.description}
          </p>

          {job.photos?.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {job.photos.map((p, i) => (
                <img key={i} src={p} alt="" className="w-full aspect-square rounded-xl object-cover" />
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground mb-4">
            {t.contact_method}: {t[job.contact_method] || job.contact_method}
          </p>

          <div className="flex gap-2">
            {job.contact_method === 'phone' && (
              <a href={`tel:${job.contact_info}`} className="flex-1">
                <Button className="w-full rounded-xl gap-2">
                  <Phone className="w-4 h-4" /> {t.call}
                </Button>
              </a>
            )}
            {job.contact_method === 'whatsapp' && (
              <a href={`https://wa.me/${job.contact_info.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full rounded-xl gap-2 bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>

        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
              <Flag className="w-4 h-4" /> {t.report}
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t.report}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full p-2 rounded-xl border border-border bg-background">
                <option value="fake_profile">{t.fake_profile}</option>
                <option value="scam">{t.scam}</option>
                <option value="inappropriate">{t.inappropriate}</option>
                <option value="spam">{t.spam}</option>
              </select>
              <Textarea value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} placeholder={t.report_description} rows={3} />
              <Button onClick={submitReport} variant="destructive" className="w-full rounded-xl">{t.submit_report}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}