import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Moon, Sun, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { t, lang, rtl, switchLanguage } = useLanguage();
  const navigate = useNavigate();
  const [, setForceRender] = useState(0);

  const handleLangSwitch = (newLang) => {
    switchLanguage(newLang);
    setForceRender(prev => prev + 1);
  };

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      <div className="sticky top-0 z-40 bg-card border-b border-border px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">{t.settings}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        {/* Language */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t.language}
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => handleLangSwitch('en')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                lang === 'en' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
              }`}
            >
              <span className="text-xl">🇬🇧</span>
              <span className="font-medium">English</span>
              {lang === 'en' && <span className="ml-auto w-2 h-2 rounded-full bg-primary" />}
            </button>
            <button
              onClick={() => handleLangSwitch('ar')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                lang === 'ar' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
              }`}
            >
              <span className="text-xl">🇱🇾</span>
              <span className="font-medium font-arabic">العربية</span>
              {lang === 'ar' && <span className="ml-auto w-2 h-2 rounded-full bg-primary" />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">{t.terms}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.warning_price}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">Khidma Libya v1.0</p>
          <p className="text-xs text-muted-foreground font-arabic">خدمة ليبيا</p>
        </div>
      </div>
    </div>
  );
}