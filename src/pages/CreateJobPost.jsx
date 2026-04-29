import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import { CATEGORIES, CITIES, CITIES_AR } from "../lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function CreateJobPost() {
  const navigate = useNavigate();
  const { t, lang, rtl } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);

  const [form, setForm] = useState({
    title: '', title_ar: '', category: '', city: '',
    description: '', description_ar: '', budget: '',
    urgency: 'normal', contact_method: 'phone', contact_info: '',
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPhotos(prev => [...prev, file_url]);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.city || !form.description || !form.contact_info) {
      toast.error("Please fill required fields");
      return;
    }
    setLoading(true);
    const user = await base44.auth.me();
    await base44.entities.JobPost.create({
      ...form,
      budget: form.budget ? Number(form.budget) : undefined,
      photos,
      poster_email: user.email,
      poster_name: user.full_name,
      status: 'open',
    });
    toast.success(t.success);
    navigate('/jobs');
    setLoading(false);
  };

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      <div className="sticky top-0 z-40 bg-card border-b border-border px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">{t.create_job}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-5">
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t.job_title} *</label>
          <Input value={form.title} onChange={(e) => setForm(p => ({...p, title: e.target.value}))} className="rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.categories} *</label>
            <Select value={form.category} onValueChange={(v) => setForm(p => ({...p, category: v}))}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder={t.categories} /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{t[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.city} *</label>
            <Select value={form.city} onValueChange={(v) => setForm(p => ({...p, city: v}))}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder={t.city} /></SelectTrigger>
              <SelectContent>
                {CITIES.map(c => (
                  <SelectItem key={c} value={c}>{lang === 'ar' ? CITIES_AR[c] : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">{t.description} *</label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm(p => ({...p, description: e.target.value}))}
            rows={4}
            className="rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.budget}</label>
            <Input value={form.budget} onChange={(e) => setForm(p => ({...p, budget: e.target.value}))} className="rounded-xl" type="number" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.urgency}</label>
            <Select value={form.urgency} onValueChange={(v) => setForm(p => ({...p, urgency: v}))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">{t.normal}</SelectItem>
                <SelectItem value="urgent">{t.urgent}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.contact_method}</label>
            <Select value={form.contact_method} onValueChange={(v) => setForm(p => ({...p, contact_method: v}))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">{t.phone}</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.contact_info} *</label>
            <Input value={form.contact_info} onChange={(e) => setForm(p => ({...p, contact_info: e.target.value}))} className="rounded-xl" />
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t.work_photos}</label>
          <div className="flex gap-2 flex-wrap">
            {photos.map((p, i) => (
              <img key={i} src={p} alt="" className="w-20 h-20 rounded-xl object-cover" />
            ))}
            <label className="w-20 h-20 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:bg-secondary/50">
              <Camera className="w-5 h-5 text-muted-foreground" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 rounded-2xl text-base font-semibold">
          {loading ? t.loading : t.post_job}
        </Button>
      </div>
    </div>
  );
}