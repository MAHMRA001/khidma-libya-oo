import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Plus, X, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useLanguage from "../hooks/useLanguage";
import { CATEGORIES, CITIES, CITIES_AR } from "../lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import NativePicker from "../components/common/NativePicker";
import { toast } from "sonner";

export default function CreateBusiness() {
  const navigate = useNavigate();
  const { t, lang, rtl } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(null);
  const [form, setForm] = useState({
    business_name: '', business_name_ar: '', category: '', city: '',
    description: '', description_ar: '', phone: '', whatsapp: '',
    address: '', working_hours: '', working_days: '',
    service_type: 'both', logo: '', website: '',
  });
  const [newPost, setNewPost] = useState({ caption: '', photos: [] });
  const [posts, setPosts] = useState([]);
  const [postLoading, setPostLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async user => {
      const list = await base44.entities.BusinessProfile.filter({ owner_email: user.email });
      if (list.length > 0) {
        setExisting(list[0]);
        const b = list[0];
        setForm({
          business_name: b.business_name || '', business_name_ar: b.business_name_ar || '',
          category: b.category || '', city: b.city || '',
          description: b.description || '', description_ar: b.description_ar || '',
          phone: b.phone || '', whatsapp: b.whatsapp || '',
          address: b.address || '', working_hours: b.working_hours || '',
          working_days: b.working_days || '', service_type: b.service_type || 'both',
          logo: b.logo || '', website: b.website || '',
        });
        const existingPosts = await base44.entities.BusinessPost.filter({ business_id: list[0].id });
        setPosts(existingPosts);
      }
    });
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, logo: file_url }));
  };

  const handlePostPhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    const urls = await Promise.all(files.map(async f => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      return file_url;
    }));
    setNewPost(p => ({ ...p, photos: [...p.photos, ...urls] }));
  };

  const submitPost = async () => {
    if (!existing) { toast.error("Save your business profile first"); return; }
    if (!newPost.caption && newPost.photos.length === 0) return;
    setPostLoading(true);
    const user = await base44.auth.me();
    const created = await base44.entities.BusinessPost.create({
      business_id: existing.id,
      business_name: existing.business_name,
      owner_email: user.email,
      caption: newPost.caption,
      photos: newPost.photos,
    });
    setPosts(p => [created, ...p]);
    setNewPost({ caption: '', photos: [] });
    setPostLoading(false);
    toast.success("Post published!");
  };

  const deletePost = async (postId) => {
    await base44.entities.BusinessPost.delete(postId);
    setPosts(p => p.filter(x => x.id !== postId));
  };

  const handleSubmit = async () => {
    if (!form.business_name || !form.category || !form.city || !form.phone) {
      toast.error("Please fill required fields");
      return;
    }
    setLoading(true);
    const user = await base44.auth.me();
    const data = { ...form, owner_email: user.email, verification_status: 'pending' };
    if (existing) {
      await base44.entities.BusinessProfile.update(existing.id, data);
    } else {
      await base44.entities.BusinessProfile.create(data);
    }
    await base44.auth.updateMe({ account_type: 'business' });
    toast.success(t.success);
    navigate('/businesses');
    setLoading(false);
  };

  return (
    <div className={`min-h-screen ${rtl ? 'font-arabic' : 'font-sans'}`}>
      <div className="sticky top-0 z-40 bg-card border-b border-border px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">{existing ? t.edit_business : t.create_business}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-5">
        {/* Logo */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t.profile_photo}</label>
          <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/50 overflow-hidden">
            {form.logo ? <img src={form.logo} alt="" className="w-full h-full object-cover" /> : (
              <><Camera className="w-6 h-6 text-muted-foreground mb-1" /><span className="text-xs text-muted-foreground">{t.upload_photo}</span></>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">{t.business_name} *</label>
          <Input value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} className="rounded-xl" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t.business_name} (العربية)</label>
          <Input value={form.business_name_ar} onChange={e => setForm(p => ({ ...p, business_name_ar: e.target.value }))} className="rounded-xl font-arabic" dir="rtl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.categories} *</label>
            <NativePicker value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))} placeholder={t.categories} options={CATEGORIES.map(c => ({ value: c, label: t[c] }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.city} *</label>
            <NativePicker value={form.city} onValueChange={v => setForm(p => ({ ...p, city: v }))} placeholder={t.city} options={CITIES.map(c => ({ value: c, label: lang === 'ar' ? CITIES_AR[c] : c }))} className="rounded-xl" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">{t.service_type}</label>
          <NativePicker value={form.service_type} onValueChange={v => setForm(p => ({ ...p, service_type: v }))} placeholder={t.service_type}
            options={[{ value: 'walk_in', label: t.walk_in }, { value: 'home_visit', label: t.home_visit }, { value: 'both', label: t.both }]}
            className="rounded-xl" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">{t.description}</label>
          <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.phone} *</label>
            <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl" type="tel" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.whatsapp}</label>
            <Input value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} className="rounded-xl" type="tel" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">{t.address}</label>
          <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="rounded-xl" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5"><Globe className="w-4 h-4" /> Website (optional)</label>
          <Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} className="rounded-xl" placeholder="https://yourwebsite.com" type="url" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.working_hours}</label>
            <Input value={form.working_hours} onChange={e => setForm(p => ({ ...p, working_hours: e.target.value }))} className="rounded-xl" placeholder="e.g. 8am - 6pm" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.working_days}</label>
            <Input value={form.working_days} onChange={e => setForm(p => ({ ...p, working_days: e.target.value }))} className="rounded-xl" placeholder="e.g. Sat-Thu" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
          Your business will be reviewed and verified by our team before appearing in the listings.
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 rounded-2xl text-base font-semibold">
          {loading ? t.loading : (existing ? t.save : t.create_business)}
        </Button>

        {/* Posts section — only visible after business is created */}
        {existing && (
          <div className="space-y-4 pt-2 border-t border-border">
            <h2 className="font-bold text-base">Posts</h2>

            {/* New post composer */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <Textarea
                value={newPost.caption}
                onChange={e => setNewPost(p => ({ ...p, caption: e.target.value }))}
                placeholder="Share an update, offer, or work photo..."
                rows={2}
                className="rounded-xl"
              />
              {newPost.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {newPost.photos.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="w-full aspect-square rounded-xl object-cover" />
                      <button onClick={() => setNewPost(p => ({ ...p, photos: p.photos.filter((_, j) => j !== i) }))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium cursor-pointer hover:bg-secondary">
                  <Camera className="w-4 h-4" /> Add Photos
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePostPhotoUpload} />
                </label>
                <Button onClick={submitPost} disabled={postLoading} size="sm" className="ml-auto rounded-xl">
                  {postLoading ? t.loading : "Post"}
                </Button>
              </div>
            </div>

            {/* Existing posts */}
            {posts.map(post => (
              <div key={post.id} className="bg-card border border-border rounded-2xl p-4 space-y-2">
                {post.caption && <p className="text-sm">{post.caption}</p>}
                {post.photos?.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {post.photos.map((url, i) => <img key={i} src={url} alt="" className="w-full aspect-square rounded-xl object-cover" />)}
                  </div>
                )}
                <button onClick={() => deletePost(post.id)} className="text-xs text-destructive hover:underline">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}