import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import moment from "moment";

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, rtl } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [convo, setConvo] = useState(null);
  const [user, setUser] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const [c, msgs] = await Promise.all([
      base44.entities.Conversation.get(id),
      base44.entities.Message.filter({ conversation_id: id }, 'created_date', 200),
    ]);
    setConvo(c);
    setMessages(msgs);

    // Mark as read
    if (c?.unread_by?.includes(u.email)) {
      const newUnread = c.unread_by.filter(e => e !== u.email);
      await base44.entities.Conversation.update(id, { unread_by: newUnread });
    }
  };

  useEffect(() => {
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === id) {
        if (event.type === 'create') {
          setMessages(prev => [...prev, event.data]);
        }
      }
    });
    return unsub;
  }, [id]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const msg = text.trim();
    setText("");
    
    await base44.entities.Message.create({
      conversation_id: id,
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      text: msg,
      read: false,
    });

    // Update conversation
    const otherEmails = convo.participant_emails?.filter(e => e !== user.email) || [];
    await base44.entities.Conversation.update(id, {
      last_message: msg,
      last_message_at: new Date().toISOString(),
      unread_by: otherEmails,
    });
    setSending(false);
  };

  const getOtherName = () => {
    if (!user || !convo) return '';
    const idx = convo.participant_emails?.indexOf(user.email);
    const names = convo.participant_names || [];
    return names[idx === 0 ? 1 : 0] || 'Unknown';
  };

  return (
    <div className={`flex flex-col h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border px-5 py-3 flex-shrink-0">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="font-bold text-primary text-sm">{getOtherName().charAt(0)}</span>
          </div>
          <h1 className="font-bold">{getOtherName()}</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 max-w-lg w-full mx-auto">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isMe = msg.sender_email === user?.email;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border text-foreground rounded-bl-sm'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {moment(msg.created_date).format('HH:mm')}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-card border-t border-border px-5 py-3 pb-safe">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={t.message || 'Message...'}
            className="flex-1 h-11 px-4 rounded-2xl bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}