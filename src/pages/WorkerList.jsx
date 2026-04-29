import { useState, useEffect } from "react";
import { ArrowLeft, SlidersHorizontal, Map } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import WorkerCard from "../components/cards/WorkerCard";
import CategoryIcon from "../components/common/CategoryIcon";
import { CATEGORIES, CITIES, CITIES_AR } from "../lib/i18n";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function WorkerList() {
  const { t, lang, rtl } = useLanguage();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const [category, setCategory] = useState(urlParams.get('category') || '');
  const [city, setCity] = useState(urlParams.get('city') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery] = useState(urlParams.get('search') || '');

  useEffect(() => {
    loadWorkers();
  }, [category, city, verifiedOnly]);

  const loadWorkers = async () => {
    setLoading(true);
    const filter = {};
    if (category) filter.category = category;
    if (city) filter.city = city;
    if (verifiedOnly) filter.verification_status = 'verified';
    
    const data = Object.keys(filter).length > 0
      ? await base44.entities.WorkerProfile.filter(filter, '-created_date', 50)
      : await base44.entities.WorkerProfile.list('-created_date', 50);
    
    let filtered = data;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = data.filter(w => 
        w.full_name?.toLowerCase().includes(q) ||
        w.description?.toLowerCase().includes(q) ||
        w.full_name_ar?.includes(q) ||
        w.description_ar?.includes(q)
      );
    }
    setWorkers(filtered);
    setLoading(false);
  };

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg">{t.browse_workers}</h1>
          </div>
          <div className="flex items-center gap-2">
          <Link to="/map" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
            <Map className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${showFilters ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-4">
        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4 p-4 rounded-2xl bg-card border border-border space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t.categories}</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t.all_categories} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all_categories}</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{t[cat]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t.city}</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t.all_cities} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all_cities}</SelectItem>
                  {CITIES.map(c => (
                    <SelectItem key={c} value={c}>{lang === 'ar' ? CITIES_AR[c] : c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t.verified_only}</label>
              <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setCategory(''); setCity(''); setVerifiedOnly(false); }}
              className="w-full"
            >
              {t.reset}
            </Button>
          </div>
        )}

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
          <button
            onClick={() => setCategory('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !category ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {t.all_categories}
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? '' : cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {t[cat]}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t.no_results}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}