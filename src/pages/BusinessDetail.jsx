import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, Star, BadgeCheck, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import CategoryIcon from "../components/common/CategoryIcon";
import { CITIES_AR } from "../lib/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import NativePicker from "../components/common/NativePicker";
import { toast } from "sonner";

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang, rtl } = useLanguage();
  const [biz, setBiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({ customer_phone: '', service_description: '', preferred_date: '', preferred_time: '', appointment_type: 'walk_in', address: '', notes: '' });

  useEffect(() => {
    base44.entities.BusinessProfile.get(id).then(b => { setBiz(b); setLoading(false); });
  }, [id]);

  const submitBooking = async () => {
    if (!form.customer_phone || !form.preferred_date) { toast.error("Please fill required fields"); return; }
    setBooking(true);
    const user = await base44.auth.me();
    await base44.entities.Appointment.create({
      business_id: id,
      business_name: biz.business_name,
      customer_email: user.email,
      customer_name: user.full_name,
      ...form,
    });
    setBookOpen(false);
    toast.success(t.success);
    setBooking(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  if (!biz) return null;

  const cityLabel = lang === 'ar' ? (CITIES_AR[biz.city] || biz.city) : biz.city;
  const name = lang === 'ar' && biz.business_name_ar ? biz.business_name_ar : biz.business_name;

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      <div className="sticky top-0 z-40 bg-card border-b border-border px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg truncate">{name}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        {/* Header Card */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">
            {biz.logo ? (
              <img src={biz.logo} alt={name} className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <CategoryIcon category={biz.category} size="w-16 h-16" iconSize="w-8 h-8" />
            )}
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <h2 className="font-bold text-lg">{name}</h2>
                <BadgeCheck className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{t[biz.category]}</p>
              {biz.avg_rating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{biz.avg_rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({biz.review_count})</span>
                </div>
              )}
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{cityLabel}{biz.address ? ` — ${biz.address}` : ''}</span>
            </div>
            {biz.working_hours && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{biz.working_hours}{biz.working_days ? ` · ${biz.working_days}` : ''}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-foreground leading-relaxed mb-4">
            {lang === 'ar' && biz.description_ar ? biz.description_ar : biz.description}
          </p>

          {biz.photos?.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {biz.photos.map((p, i) => <img key={i} src={p} alt="" className="w-full aspect-square rounded-xl object-cover" />)}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-2">
            {biz.phone && (
              <a href={`tel:${biz.phone}`} className="flex-1">
                <Button variant="outline" className="w-full rounded-xl gap-2">
                  <Phone className="w-4 h-4" /> {t.call}
                </Button>
              </a>
            )}
            {biz.whatsapp && (
              <a href={`https://wa.me/${biz.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full rounded-xl gap-2 bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Book Appointment */}
        <Dialog open={bookOpen} onOpenChange={setBookOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 rounded-2xl gap-2 text-base font-semibold">
              <Calendar className="w-5 h-5" /> {t.book_appointment}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t.book_appointment}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              {(biz.service_type === 'both' || biz.service_type) && (
                <div>
                  <label className="text-sm font-medium mb-1 block">{t.appointment_type}</label>
                  <NativePicker value={form.appointment_type} onValueChange={v => setForm(p => ({ ...p, appointment_type: v }))}
                    placeholder={t.appointment_type}
                    options={[
                      { value: 'walk_in', label: t.walk_in },
                      { value: 'home_visit', label: t.home_visit },
                    ]} className="rounded-xl" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-1 block">{t.phone} *</label>
                <Input value={form.customer_phone} onChange={e => setForm(p => ({ ...p, customer_phone: e.target.value }))} className="rounded-xl" type="tel" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t.preferred_date} *</label>
                  <Input value={form.preferred_date} onChange={e => setForm(p => ({ ...p, preferred_date: e.target.value }))} className="rounded-xl" type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t.preferred_time}</label>
                  <Input value={form.preferred_time} onChange={e => setForm(p => ({ ...p, preferred_time: e.target.value }))} className="rounded-xl" type="time" />
                </div>
              </div>
              {form.appointment_type === 'home_visit' && (
                <div>
                  <label className="text-sm font-medium mb-1 block">{t.address}</label>
                  <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="rounded-xl" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-1 block">{t.service_description}</label>
                <Textarea value={form.service_description} onChange={e => setForm(p => ({ ...p, service_description: e.target.value }))} rows={2} className="rounded-xl" />
              </div>
              <Button onClick={submitBooking} disabled={booking} className="w-full rounded-xl">
                {booking ? t.loading : t.book_now}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}