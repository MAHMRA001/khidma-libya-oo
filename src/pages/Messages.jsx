import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import moment from "moment";

export default function Messages() {
  const { t, rtl } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const convos = await base44.entities.Conversation.list('-last_message_at', 50);
    const mine = convos.filter(c => c.participant_emails?.includes(u.email));
    setConversations(mine);
    setLoading(false);
  };

  useEffect(() => {
    const unsub = base44.entities.Conversation.subscribe(() => loadData());
    return unsub;
  }, []);

  const getOtherName = (convo) => {
    if (!user) return '';
    const idx = convo.participant_emails?.indexOf(user.email);
    const names = convo.participant_names || [];
    return names[idx === 0 ? 1 : 0] || 'Unknown';
  };

  const hasUnread = (convo) => convo.unread_by?.includes(user?.email);

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      <div className="sticky top-0 z-40 bg-card border-b border-border px-5 py-3">
        <div className="max-w-lg mx-auto">
          <h1 className="font-bold text-lg">{t.message || 'Messages'}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">{t.no_results}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((convo) => (
              <Link key={convo.id} to={`/chat/${convo.id}`}>
                <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${hasUnread(convo) ? 'bg-primary/5 border-primary/20' : 'bg-card border-border hover:bg-secondary/50'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary text-lg">{getOtherName(convo).charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`font-semibold text-sm ${hasUnread(convo) ? 'text-primary' : ''}`}>{getOtherName(convo)}</span>
                      <span className="text-xs text-muted-foreground">{convo.last_message_at ? moment(convo.last_message_at).fromNow() : ''}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{convo.last_message || '...'}</p>
                  </div>
                  {hasUnread(convo) && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}