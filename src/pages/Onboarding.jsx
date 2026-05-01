import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Briefcase, Wrench, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({ account_type: selected });
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-2xl font-bold text-primary-foreground font-arabic">خ</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {lang === "ar" ? "كيف ستستخدم التطبيق؟" : "How will you use the app?"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "اختر دورك لنضبط تجربتك" : "Choose your role to set up your experience"}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isActive = selected === role.value;
            return (
              <button
                key={role.value}
                onClick={() => setSelected(role.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  isActive ? role.activeColor : "border-border bg-card hover:bg-secondary/50"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${role.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {lang === "ar" ? role.label_ar : role.label_en}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "ar" ? role.desc_ar : role.desc_en}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${isActive ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                  {isActive && <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />}
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected || saving}
          className="w-full h-12 rounded-2xl text-base font-semibold"
        >
          {saving ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...") : (lang === "ar" ? "متابعة" : "Continue")}
        </Button>
      </motion.div>
    </div>
  );
}