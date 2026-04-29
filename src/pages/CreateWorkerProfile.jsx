import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Camera } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import { CATEGORIES, CITIES, CITIES_AR } from "../lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import NativePicker from "../components/common/NativePicker";
import { toast } from "sonner";

export default function CreateWorkerProfile() {
  const navigate = useNavigate();
  const { t, lang, rtl } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);

  const [form, setForm] = useState({
    full_name: '', full_name_ar: '', city: '', nationality: '', category: '',
    description: '', description_ar: '', phone: '', whatsapp: '',
    price_min: '', price_max: '', profile_photo: '', id_document: '', selfie_photo: '',
  });

  useEffect(() => {
    base44.auth.me().then(async (user) => {
      const profiles = await base44.entities.WorkerProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        setExistingProfile(profiles[0]);
        const p = profiles[0];
        setForm({
          full_name: p.full_name || '', full_name_ar: p.full_name_ar || '',
          city: p.city || '', nationality: p.nationality || '', category: p.category || '',
          description: p.description || '', description_ar: p.description_ar || '',
          phone: p.phone || '', whatsapp: p.whatsapp || '',
          price_min: p.price_min?.toString() || '', price_max: p.price_max?.toString() || '',
          profile_photo: p.profile_photo || '', id_document: p.id_document || '', selfie_photo: p.selfie_photo || '',
        });
      }
    });
  }, []);

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, [field]: file_url }));
    toast.success(t.success);
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.city || !form.category || !form.phone) {
      toast.error("Please fill required fields");
      return;
    }
    setLoading(true);
    const user = await base44.auth.me();
    const data = {
      ...form,
      price_min: form.price_min ? Number(form.price_min) : undefined,
      price_max: form.price_max ? Number(form.price_max) : undefined,
      user_email: user.email,
      verification_status: 'pending',
    };

    if (existingProfile) {
      await base44.entities.WorkerProfile.update(existingProfile.id, data);
    } else {
      await base44.entities.WorkerProfile.create(data);
    }

    await base44.auth.updateMe({ account_type: 'worker' });
    toast.success(t.success);
    navigate('/profile');
    setLoading(false);
  };

  const FileUploadBox = ({ label, field, value }) => (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors overflow-hidden">
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <>
            <Camera className="w-6 h-6 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">{t.upload_photo}</span>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, field)} />
      </label>
    </div>
  );

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      <div className="sticky top-0 z-40 bg-card border-b border-border px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">{existingProfile ? t.edit_profile : t.create_profile}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1.5 block">{t.full_name} *</label>
            <Input value={form.full_name} onChange={(e) => setForm(p => ({...p, full_name: e.target.value}))} className="rounded-xl" />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1.5 block">{t.full_name} (العربية)</label>
            <Input value={form.full_name_ar} onChange={(e) => setForm(p => ({...p, full_name_ar: e.target.value}))} className="rounded-xl font-arabic" dir="rtl" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.city} *</label>
            <NativePicker value={form.city} onValueChange={(v) => setForm(p => ({...p, city: v}))} placeholder={t.city} options={CITIES.map(c => ({ value: c, label: lang === 'ar' ? CITIES_AR[c] : c }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.nationality}</label>
            <Input value={form.nationality} onChange={(e) => setForm(p => ({...p, nationality: e.target.value}))} className="rounded-xl" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">{t.categories} *</label>
          <NativePicker value={form.category} onValueChange={(v) => setForm(p => ({...p, category: v}))} placeholder={t.categories} options={CATEGORIES.map(cat => ({ value: cat, label: t[cat] }))} className="rounded-xl" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">{t.service_description}</label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm(p => ({...p, description: e.target.value}))}
            placeholder={t.service_description}
            rows={3}
            className="rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.phone} *</label>
            <Input value={form.phone} onChange={(e) => setForm(p => ({...p, phone: e.target.value}))} className="rounded-xl" type="tel" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.whatsapp}</label>
            <Input value={form.whatsapp} onChange={(e) => setForm(p => ({...p, whatsapp: e.target.value}))} className="rounded-xl" type="tel" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.price_min}</label>
            <Input value={form.price_min} onChange={(e) => setForm(p => ({...p, price_min: e.target.value}))} className="rounded-xl" type="number" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.price_max}</label>
            <Input value={form.price_max} onChange={(e) => setForm(p => ({...p, price_max: e.target.value}))} className="rounded-xl" type="number" />
          </div>
        </div>

        {/* Photo uploads */}
        <div className="grid grid-cols-3 gap-3">
          <FileUploadBox label={t.profile_photo} field="profile_photo" value={form.profile_photo} />
          <FileUploadBox label={t.id_document} field="id_document" value={form.id_document} />
          <FileUploadBox label={t.selfie} field="selfie_photo" value={form.selfie_photo} />
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 rounded-2xl text-base font-semibold">
          {loading ? t.loading : (existingProfile ? t.save : t.create_profile)}
        </Button>
      </div>
    </div>
  );
}