import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import useLanguage from "../../hooks/useLanguage";
import CategoryIcon from "../common/CategoryIcon";
import VerificationBadge from "../common/VerificationBadge";
import { CITIES_AR } from "../../lib/i18n";

export default function WorkerCard({ worker }) {
  const { t, lang } = useLanguage();
  const cityLabel = lang === 'ar' ? (CITIES_AR[worker.city] || worker.city) : worker.city;

  return (
    <Link to={`/worker/${worker.id}`} className="block">
      <div className="bg-card rounded-2xl border border-border p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {worker.profile_photo ? (
              <img
                src={worker.profile_photo}
                alt={worker.full_name}
                className="w-14 h-14 rounded-xl object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">
                  {worker.full_name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            {worker.is_featured && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="w-2.5 h-2.5 text-white fill-white" />
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-foreground truncate">
                {lang === 'ar' && worker.full_name_ar ? worker.full_name_ar : worker.full_name}
              </h3>
              {worker.verification_status === 'verified' && (
                <VerificationBadge status="verified" showLabel={false} />
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <CategoryIcon category={worker.category} size="w-4 h-4" iconSize="w-2.5 h-2.5" />
              <span>{t[worker.category] || worker.category}</span>
              <span className="text-border">·</span>
              <MapPin className="w-3 h-3" />
              <span>{cityLabel}</span>
            </div>

            <div className="flex items-center justify-between">
              {worker.avg_rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{worker.avg_rating?.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({worker.review_count})</span>
                </div>
              )}
              {(worker.price_min || worker.price_max) && (
                <span className="text-xs font-semibold text-primary">
                  {worker.price_min && worker.price_max
                    ? `${worker.price_min} - ${worker.price_max} ${t.lyd}`
                    : `${worker.price_min || worker.price_max} ${t.lyd}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}