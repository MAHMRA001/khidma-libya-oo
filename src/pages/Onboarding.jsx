import { useState } from "react";
import NativePicker from "../components/common/NativePicker";
import { CITIES, CITIES_AR } from "../lib/i18n";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Briefcase, Wrench, Users, User, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const ROLES = [
  {
    value: "customer",
    icon: Briefcase,
    label_en: "I need a service",
    label_ar: "أحتاج خدمة",
    desc_en: "Post jobs and hire workers or book businesses",
    desc_ar: "انشر وظائف واستأجر عمالاً أو احجز مشاريع",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    activeColor: "bg-blue-100 border-blue-500",
  },
  {
    value: "worker",
    icon: Wrench,
    label_en: "I offer services",
    label_ar: "أقدّم خدمة",
    desc_en: "Create a worker profile and get hired",
    desc_ar: "أنشئ ملف عامل واحصل على عمل",
    color: "bg-green-50 border-green-200 text-green-700",
    activeColor: "bg-green-100 border-green-500",
  },
  {
    value: "both",
    icon: Users,
    label_en: "Both",
    label_ar: "كلاهما",
    desc_en: "Post jobs and offer services",
    desc_ar: "انشر وظائف وقدّم خدمات",
    color: "bg-purple-50 border-purple-200 text-purple-700",
    activeColor: "bg-purple-100 border-purple-500",
  },
];

export default function Onboarding() {
  const { lang, rtl } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 — profile info
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 — role & city
  const [selected, setSelected] = useState(null);
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStep1 = () => {
    if (!fullName.trim() || !address.trim()) {
      toast.error(lang === 'ar' ? 'يرجى ملء الاسم والعنوان' : 'Please fill in your name and address');
      return;
    }
    setStep(2);
  };

  const handleFinish = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({
        full_name: fullName,
        address,
        phone,
        account_type: selected,
        city,
      });
      if (selected === "worker") {
        navigate("/create-worker-profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(lang === "ar" ? "حدث خطأ، حاول مجدداً" : "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col items-center justify-center px-6 ${rtl ? "font-arabic" : "font-sans"}`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-2xl font-bold text-primary-foreground font-arabic">خ</span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`h-2 rounded-full transition-all ${s === step ? 'w-8 bg-primary' : s < step ? 'w-4 bg-primary/40' : 'w-4 bg-border'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {lang === 'ar' ? 'معلوماتك الشخصية' : 'Your Info'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar' ? 'أدخل بياناتك الأساسية' : 'Fill in your basic details'}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {lang === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {lang === 'ar' ? 'العنوان *' : 'Address *'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: طرابلس، شارع ...' : 'e.g. Tripoli, Street...'}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {lang === 'ar' ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'}
                  </label>
                  <Input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+218..."
                    type="tel"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <Button onClick={handleStep1} className="w-full h-12 rounded-2xl text-base font-semibold">
                {lang === 'ar' ? 'التالي' : 'Next'}
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {lang === 'ar' ? 'كيف ستستخدم التطبيق؟' : 'How will you use the app?'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar' ? 'اختر دورك لنضبط تجربتك' : 'Choose your role to set up your experience'}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isActive = selected === role.value;
                  return (
                    <button
                      key={role.value}
                      onClick={() => setSelected(role.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${isActive ? role.activeColor : "border-border bg-card hover:bg-secondary/50"}`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${role.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{lang === 'ar' ? role.label_ar : role.label_en}</p>
                        <p className="text-xs text-muted-foreground">{lang === 'ar' ? role.desc_ar : role.desc_en}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${isActive ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                        {isActive && <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-2">
                  {lang === 'ar' ? 'مدينتك' : 'Your City'}
                </p>
                <NativePicker
                  value={city}
                  onValueChange={setCity}
                  placeholder={lang === 'ar' ? 'اختر مدينتك' : 'Select your city'}
                  options={CITIES.map(c => ({ value: c, label: lang === 'ar' ? CITIES_AR[c] : c }))}
                  className="rounded-xl"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-2xl">
                  {lang === 'ar' ? 'رجوع' : 'Back'}
                </Button>
                <Button onClick={handleFinish} disabled={!selected || saving} className="flex-1 h-12 rounded-2xl text-base font-semibold">
                  {saving ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'إنهاء' : 'Finish')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}