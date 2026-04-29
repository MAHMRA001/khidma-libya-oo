import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, MessageCircle, Flag, Star, BadgeCheck, ExternalLink, Map } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import CategoryIcon from "../components/common/CategoryIcon";
import VerificationBadge from "../components/common/VerificationBadge";
import StarRating from "../components/common/StarRating";
import { CITIES_AR } from "../lib/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang, rtl } = useLanguage();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [reportReason, setReportReason] = useState("fake_profile");
  const [reportDesc, setReportDesc] = useState("");
  const [user, setUser] = useState(null);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    const [w, r, u] = await Promise.all([
      base44.entities.WorkerProfile.get(id),
      base44.entities.Review.filter({ worker_profile_id: id }, '-created_date', 50),
      base44.auth.me().catch(() => null),
    ]);
    setWorker(w);
    setReviews(r);
    setUser(u);
    setLoading(false);
  };

  const submitReview = async () => {
    if (!newRating) return;
    await base44.entities.Review.create({
      worker_profile_id: id,
      rating: newRating,
      comment: newComment,
      reviewer_email: user?.email,
      reviewer_name: user?.full_name || 'Anonymous',
    });
    // Update worker avg
    const allReviews = [...reviews, { rating: newRating }];
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await base44.entities.WorkerProfile.update(id, {
      avg_rating: Math.round(avg * 10) / 10,
      review_count: allReviews.length,
    });
    setReviewOpen(false);
    setNewRating(0);
    setNewComment("");
    toast.success(t.success);
    loadData();
  };

  const startChat = async () => {
    if (!user || startingChat) return;
    setStartingChat(true);
    // Find or create conversation
    const convos = await base44.entities.Conversation.list('-created_date', 200);
    let convo = convos.find(c =>
      c.worker_profile_id === id && c.participant_emails?.includes(user.email)
    );
    if (!convo) {
      const workerUser = worker.user_email
        ? [{ email: worker.user_email, name: lang === 'ar' && worker.full_name_ar ? worker.full_name_ar : worker.full_name }]
        : [];
      convo = await base44.entities.Conversation.create({
        worker_profile_id: id,
        worker_name: worker.full_name,
        customer_email: user.email,
        participant_emails: [user.email, worker.user_email || `worker_${id}`],
        participant_names: [user.full_name || user.email, lang === 'ar' && worker.full_name_ar ? worker.full_name_ar : worker.full_name],
        unread_by: [],
      });
    }
    navigate(`/chat/${convo.id}`);
    setStartingChat(false);
  };

  const submitReport = async () => {
    await base44.entities.Report.create({
      reported_type: 'worker',
      reported_id: id,
      reported_name: worker?.full_name,
      reporter_email: user?.email,
      reason: reportReason,
      description: reportDesc,
    });
    setReportOpen(false);
    toast.success(t.success);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!worker) return null;

  const cityLabel = lang === 'ar' ? (CITIES_AR[worker.city] || worker.city) : worker.city;

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      {/* Header Image */}
      <div className="relative h-56 bg-gradient-to-br from-primary/20 to-primary/5">
        {worker.profile_photo && (
          <img src={worker.profile_photo} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-12 relative z-10">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-card -mt-10 bg-card flex-shrink-0">
              {worker.profile_photo ? (
                <img src={worker.profile_photo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">{worker.full_name?.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold">{lang === 'ar' && worker.full_name_ar ? worker.full_name_ar : worker.full_name}</h1>
                <VerificationBadge status={worker.verification_status} showLabel={false} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CategoryIcon category={worker.category} size="w-5 h-5" iconSize="w-3 h-3" />
                <span>{t[worker.category]}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {cityLabel}
            </span>
            {worker.nationality && <span>{worker.nationality}</span>}
            {worker.avg_rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {worker.avg_rating?.toFixed(1)} ({worker.review_count})
              </span>
            )}
          </div>

          {(worker.price_min || worker.price_max) && (
            <div className="mb-4 p-3 rounded-xl bg-primary/5">
              <p className="text-xs text-muted-foreground mb-0.5">{t.price_range}</p>
              <p className="text-lg font-bold text-primary">
                {worker.price_min && worker.price_max
                  ? `${worker.price_min} - ${worker.price_max} ${t.lyd}`
                  : `${worker.price_min || worker.price_max} ${t.lyd}`}
                <span className="text-xs font-normal text-muted-foreground ml-1">/ {t.per_service}</span>
              </p>
            </div>
          )}

          {worker.description && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lang === 'ar' && worker.description_ar ? worker.description_ar : worker.description}
              </p>
            </div>
          )}

          {/* Contact Buttons */}
          <div className="flex gap-2 flex-wrap">
            {worker.phone && (
              <a href={`tel:${worker.phone}`} className="flex-1">
                <Button variant="outline" className="w-full rounded-xl gap-2">
                  <Phone className="w-4 h-4" />
                  {t.call}
                </Button>
              </a>
            )}
            {worker.whatsapp && (
              <a href={`https://wa.me/${worker.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full rounded-xl gap-2 bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              </a>
            )}
            <Button onClick={startChat} disabled={startingChat} variant="outline" className="w-full rounded-xl gap-2 mt-1">
              <MessageCircle className="w-4 h-4" />
              {startingChat ? t.loading : (t.message || 'In-app Message')}
            </Button>
          </div>
        </div>

        {/* Work Photos */}
        {worker.work_photos?.length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold mb-3">{t.work_photos}</h2>
            <div className="grid grid-cols-3 gap-2">
              {worker.work_photos.map((photo, i) => (
                <img key={i} src={photo} alt="" className="w-full aspect-square rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">{t.reviews} ({reviews.length})</h2>
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="rounded-xl text-xs">
                  {t.write_review}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.write_review}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t.rating}</label>
                    <StarRating rating={newRating} onRate={setNewRating} interactive size="w-8 h-8" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t.comment}</label>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={t.comment}
                      rows={3}
                    />
                  </div>
                  <Button onClick={submitReview} disabled={!newRating} className="w-full rounded-xl">
                    {t.submit_review}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t.no_reviews}</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="p-3 rounded-xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{review.reviewer_name || 'Anonymous'}</span>
                    <StarRating rating={review.rating} size="w-3.5 h-3.5" />
                  </div>
                  {review.comment && <p className="text-xs text-muted-foreground">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report */}
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors mb-8">
              <Flag className="w-4 h-4" />
              {t.report_user}
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.report_user}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-2 block">{t.report_reason}</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 rounded-xl border border-border bg-background"
                >
                  <option value="fake_profile">{t.fake_profile}</option>
                  <option value="scam">{t.scam}</option>
                  <option value="inappropriate">{t.inappropriate}</option>
                  <option value="spam">{t.spam}</option>
                </select>
              </div>
              <Textarea
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder={t.report_description}
                rows={3}
              />
              <Button onClick={submitReport} variant="destructive" className="w-full rounded-xl">
                {t.submit_report}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}