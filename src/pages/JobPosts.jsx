import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, SlidersHorizontal } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import JobCard from "../components/cards/JobCard";
import { CATEGORIES, CITIES, CITIES_AR } from "../lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={t.all_categories} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all_categories}</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{t[cat]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.city}</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={t.all_cities} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all_cities}</SelectItem>
                  {CITIES.map(c => (
                    <SelectItem key={c} value={c}>{lang === 'ar' ? CITIES_AR[c] : c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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