import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, SlidersHorizontal } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import JobCard from "../components/cards/JobCard";
import { CATEGORIES, CITIES, CITIES_AR } from "../lib/i18n";
import NativePicker from "../components/common/NativePicker";

export default function JobPosts() {
  const { t, lang, rtl } = useLanguage();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [category, city]);

  const loadJobs = async () => {
    setLoading(true);
    const filter = { status: 'open' };
    if (category && category !== 'all') filter.category = category;
    if (city && city !== 'all') filter.city = city;
    
    const data = await base44.entities.JobPost.filter(filter, '-created_date', 50);
    setJobs(data);
    setLoading(false);
  };

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      <div className="sticky top-0 z-40 bg-card border-b border-border px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="font-bold text-lg">{t.browse_jobs}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${showFilters ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <Link
              to="/create-job"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-4">
        {showFilters && (
          <div className="mb-4 p-4 rounded-2xl bg-card border border-border grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.categories}</label>
              <NativePicker value={category} onValueChange={setCategory} placeholder={t.all_categories} options={[{ value: 'all', label: t.all_categories }, ...CATEGORIES.map(cat => ({ value: cat, label: t[cat] }))]} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.city}</label>
              <NativePicker value={city} onValueChange={setCity} placeholder={t.all_cities} options={[{ value: 'all', label: t.all_cities }, ...CITIES.map(c => ({ value: c, label: lang === 'ar' ? CITIES_AR[c] : c }))]} className="rounded-xl" />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">{t.no_results}</p>
            <Link to="/create-job" className="text-primary font-medium text-sm">{t.create_job}</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}