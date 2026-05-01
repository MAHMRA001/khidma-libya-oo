import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, SlidersHorizontal, MapPin, Star, BadgeCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import CategoryIcon from "../components/common/CategoryIcon";
import { CATEGORIES, CITIES, CITIES_AR } from "../lib/i18n";
import NativePicker from "../components/common/NativePicker";

export default function Businesses() {
  const { t, lang, rtl } = useLanguage();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { loadBusinesses(); }, [category, city]);

  const loadBusinesses = async () => {
    setLoading(true);
    const filter = { verification_status: 'verified' };
    if (category && category !== 'all') filter.category = category;
    if (city && city !== 'all') filter.city = city;
    const data = await base44.entities.BusinessProfile.filter(filter, '-created_date', 50);
    setBusinesses(data);
    setLoading(false);
  };

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      <div className="sticky top-0 z-40 bg-card border-b border-border px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="font-bold text-lg">{t.businesses}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${showFilters ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <Link to="/create-business" className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground">
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
              <NativePicker value={category} onValueChange={setCategory} placeholder={t.all_categories}
                options={[{ value: 'all', label: t.all_categories }, ...CATEGORIES.map(c => ({ value: c, label: t[c] }))]}
                className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.city}</label>
              <NativePicker value={city} onValueChange={setCity} placeholder={t.all_cities}
                options={[{ value: 'all', label: t.all_cities }, ...CITIES.map(c => ({ value: c, label: lang === 'ar' ? CITIES_AR[c] : c }))]}
                className="rounded-xl" />
            </div>
          </div>
        )}

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
          <button onClick={() => setCategory('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!category ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            {t.all_categories}
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat === category ? '' : cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
              {t[cat]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">{t.no_results}</p>
            <Link to="/create-business" className="text-primary font-medium text-sm">{t.create_business}</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {businesses.map(biz => (
              <Link key={biz.id} to={`/business/${biz.id}`} className="block">
                <div className="bg-card rounded-2xl border border-border p-4 hover:shadow-lg transition-all duration-300">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {biz.logo ? (
                        <img src={biz.logo} alt={biz.business_name} className="w-14 h-14 rounded-xl object-cover" />
                      ) : (
                        <CategoryIcon category={biz.category} size="w-14 h-14" iconSize="w-7 h-7" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-semibold truncate">{lang === 'ar' && biz.business_name_ar ? biz.business_name_ar : biz.business_name}</h3>
                        <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{t[biz.category]}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{lang === 'ar' ? (CITIES_AR[biz.city] || biz.city) : biz.city}</span>
                        {biz.avg_rating > 0 && (
                          <>
                            <span className="text-border">·</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{biz.avg_rating.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${biz.service_type === 'home_visit' ? 'bg-blue-100 text-blue-700' : biz.service_type === 'walk_in' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                        {t[biz.service_type]}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}