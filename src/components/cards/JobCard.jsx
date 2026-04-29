import { Link } from "react-router-dom";
import { MapPin, Clock, AlertTriangle, DollarSign } from "lucide-react";
import useLanguage from "../../hooks/useLanguage";
import CategoryIcon from "../common/CategoryIcon";
import { CITIES_AR } from "../../lib/i18n";
import moment from "moment";

export default function JobCard({ job }) {
  const { t, lang } = useLanguage();
  const cityLabel = lang === 'ar' ? (CITIES_AR[job.city] || job.city) : job.city;

  return (
    <Link to={`/job/${job.id}`} className="block">
      <div className="bg-card rounded-2xl border border-border p-4 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <CategoryIcon category={job.category} size="w-8 h-8" iconSize="w-4 h-4" />
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                {lang === 'ar' && job.title_ar ? job.title_ar : job.title}
              </h3>
              <span className="text-xs text-muted-foreground">{t[job.category]}</span>
            </div>
          </div>
          {job.urgency === 'urgent' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              {t.urgent}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {lang === 'ar' && job.description_ar ? job.description_ar : job.description}
        </p>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {cityLabel}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {moment(job.created_date).fromNow()}
            </span>
          </div>
          {job.budget && (
            <span className="font-semibold text-primary flex items-center gap-0.5">
              {job.budget} {t.lyd}
            </span>
          )}
        </div>

        {job.is_promoted && (
          <div className="mt-2 text-[10px] text-yellow-600 font-medium uppercase tracking-wider">
            {t.promoted}
          </div>
        )}
      </div>
    </Link>
  );
}