import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Info, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { t, lang, rtl, switchLanguage } = useLanguage();
  const navigate = useNavigate();
  const [, setForceRender] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState(null);
  const [savingRole, setSavingRole] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleRoleChange = async (newRole) => {
    setSavingRole(true);
    await base44.auth.updateMe({ account_type: newRole });
    setUser(prev => ({ ...prev, account_type: newRole }));
    setSavingRole(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await base44.auth.updateMe({ account_type: null, deleted: true }).catch(() => {});
    base44.auth.logout('/welcome');
  };

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

        {/* Account Role */}
        {user && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {t.account_type}
            </h2>
            <div className="space-y-2">
              {[
                { value: 'customer', label: lang === 'ar' ? 'عميل — أحتاج خدمة' : 'Customer — I need a service' },
                { value: 'worker', label: lang === 'ar' ? 'عامل — أقدّم خدمة' : 'Worker — I offer services' },
                { value: 'both', label: lang === 'ar' ? 'كلاهما' : 'Both' },
              ].map(role => (
                <button
                  key={role.value}
                  onClick={() => handleRoleChange(role.value)}
                  disabled={savingRole}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    user.account_type === role.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span className="text-sm font-medium flex-1 text-left">{role.label}</span>
                  {user.account_type === role.value && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

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

        {/* Account Deletion */}
        <div className="mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/5 gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove your profile, job posts, messages, and all associated data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">Tranquillo v1.0</p>
          <p className="text-xs text-muted-foreground font-arabic">خدمة</p>
        </div>
      </div>
    </div>
  );
}