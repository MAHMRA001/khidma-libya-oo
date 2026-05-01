import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Welcome() {
  const [selectedLang, setSelectedLang] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedLang) {
      localStorage.setItem('khidma_lang', selectedLang);
      document.documentElement.dir = selectedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = selectedLang;
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-sm w-full"
      >
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-4xl font-bold text-primary-foreground font-arabic">خ</span>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Tranquillo</h1>
        <p className="text-lg text-primary font-arabic mb-1">خدمة</p>
        <p className="text-sm text-muted-foreground mb-10">
          {"Find trusted services & workers across Libya"}
        </p>

        <div className="space-y-3 mb-8">
          <p className="text-sm font-medium text-foreground mb-4">{"Choose your language / اختر لغتك"}</p>
          
          <button
            onClick={() => setSelectedLang('en')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
              selectedLang === 'en'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <span className="text-2xl">🇬🇧</span>
            <div className="text-left">
              <p className="font-semibold text-foreground">English</p>
              <p className="text-xs text-muted-foreground">Continue in English</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedLang('ar')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
              selectedLang === 'ar'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <span className="text-2xl">🇱🇾</span>
            <div className="text-right w-full">
              <p className="font-semibold text-foreground font-arabic">العربية</p>
              <p className="text-xs text-muted-foreground font-arabic">المتابعة بالعربية</p>
            </div>
          </button>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedLang}
          className="w-full h-12 rounded-2xl text-base font-semibold"
          size="lg"
        >
          {selectedLang === 'ar' ? 'متابعة' : 'Continue'}
        </Button>

        <div className="mt-12 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-8 h-2 rounded-full bg-primary/20" />
          <div className="w-2 h-2 rounded-full bg-primary/20" />
        </div>
      </motion.div>
    </div>
  );
}