import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home, Briefcase, User, Settings, Shield, MessageCircle } from "lucide-react";
import useLanguage from "../../hooks/useLanguage";
import { base44 } from "@/api/base44Client";

export default function AppLayout() {
  const { t, rtl, lang } = useLanguage();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin';
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const checkUnread = async () => {
      const convos = await base44.entities.Conversation.list('-last_message_at', 50);
      const count = convos.filter(c => c.participant_emails?.includes(user.email) && c.unread_by?.includes(user.email)).length;
      setUnreadCount(count);
    };
    checkUnread();
    const unsub = base44.entities.Conversation.subscribe(() => checkUnread());
    return unsub;
  }, [user]);

  const navItems = [
    { path: "/", icon: Home, label: t.home },
    { path: "/jobs", icon: Briefcase, label: t.jobs },
    { path: "/messages", icon: MessageCircle, label: t.message || 'Messages', badge: unreadCount },
    { path: "/profile", icon: User, label: t.profile },
    { path: "/settings", icon: Settings, label: t.settings },
  ];

  if (isAdmin) {
    navItems.splice(3, 0, { path: "/admin", icon: Shield, label: t.admin });
  }

  return (
    <div className={`min-h-screen bg-background ${rtl ? 'font-arabic' : 'font-sans'}`} dir={rtl ? 'rtl' : 'ltr'}>
      <main className="pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}