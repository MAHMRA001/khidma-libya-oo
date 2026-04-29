import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Approximate coordinates for Libyan cities
const CITY_COORDS = {
  Tripoli: [32.8872, 13.1913],
  Benghazi: [32.1167, 20.0667],
  Misrata: [32.3754, 15.0925],
  Sabha: [27.0377, 14.4283],
  Zawiya: [32.7527, 12.7278],
  Zliten: [32.4674, 14.5688],
  Ajdabiya: [30.7554, 20.2264],
  Sirte: [31.2089, 16.5887],
  Tobruk: [32.0864, 23.9752],
  Derna: [32.7558, 22.6376],
  Gharyan: [32.1722, 13.0203],
  Sabratha: [32.7939, 12.4876],
  Khoms: [32.6487, 14.2619],
  Tarhuna: [32.4350, 13.6334],
  Zintan: [31.9271, 12.2557],
  Other: [32.0, 15.0],
};

const categoryColors = {
  electrician: '#f59e0b',
  plumber: '#3b82f6',
  painter: '#8b5cf6',
  builder: '#f97316',
  cleaner: '#10b981',
  mechanic: '#6b7280',
  carpenter: '#d97706',
  ac_repair: '#06b6d4',
  moving_help: '#6366f1',
  home_repair: '#ef4444',
  other: '#9ca3af',
};

const createIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="width:32px;height:32px;background:${color};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

export default function WorkerMap() {
  const { t, lang, rtl } = useLanguage();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    base44.entities.WorkerProfile.filter({ verification_status: 'verified' }, '-created_date', 200)
      .then(data => { setWorkers(data); setLoading(false); });
  }, []);

  const filtered = selectedCategory
    ? workers.filter(w => w.category === selectedCategory)
    : workers;

  const categories = [...new Set(workers.map(w => w.category))];

  // Add small random offset so markers in same city don't overlap
  const getCoords = (worker) => {
    const base = CITY_COORDS[worker.city] || CITY_COORDS.Other;
    return [base[0] + (Math.random() - 0.5) * 0.05, base[1] + (Math.random() - 0.5) * 0.05];
  };

  return (
    <div className={`flex flex-col h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      <div className="sticky top-0 z-[1000] bg-card border-b border-border px-5 py-3 flex-shrink-0">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">{t.browse_workers} — Map</h1>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 border-b border-border bg-card flex-shrink-0 z-[999]">
        <button
          onClick={() => setSelectedCategory('')}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
        >
          {t.all_categories}
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            {t[cat] || cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1">
          <MapContainer
            center={[28.0, 17.0]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((worker) => {
              const coords = getCoords(worker);
              const color = categoryColors[worker.category] || '#6b7280';
              return (
                <Marker key={worker.id} position={coords} icon={createIcon(color)}>
                  <Popup>
                    <div className="p-1 min-w-[160px]">
                      <p className="font-bold text-sm mb-0.5">
                        {lang === 'ar' && worker.full_name_ar ? worker.full_name_ar : worker.full_name}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">{t[worker.category]} · {worker.city}</p>
                      {worker.price_min && (
                        <p className="text-xs font-semibold" style={{ color: '#00612e' }}>
                          {t.from || 'From'} {worker.price_min} {t.lyd}
                        </p>
                      )}
                      <a
                        href={`/worker/${worker.id}`}
                        className="mt-2 block text-center text-xs font-medium px-3 py-1.5 rounded-lg"
                        style={{ background: '#00612e', color: 'white' }}
                      >
                        {t.view_profile}
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}
    </div>
  );
}