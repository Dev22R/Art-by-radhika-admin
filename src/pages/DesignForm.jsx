import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import {
  ArrowLeft,
  UploadCloud,
  Image as ImageIcon,
  Film,
  Sparkles,
  Save,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Eye,
  Info,
  Layers,
  Clock,
  IndianRupee,
  Tag
} from 'lucide-react';
import {
  createDesign,
  updateDesign,
  fetchDesignDetails,
  clearDesignDetails
} from '../redux/slices/designsSlice';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = [
  { label: 'Bridal Mehndi', value: 'bridal' },
  { label: 'Arabic Henna', value: 'arabic' },
  { label: 'Rajasthani Traditional', value: 'rajasthani' },
  { label: 'Indo-Arabic Fusion', value: 'indo-arabic' },
  { label: 'Mandala Art', value: 'mandala' },
  { label: 'Khafif Gulf', value: 'khafif' },
  { label: 'Minimalist & Modern', value: 'minimalist' },
  { label: 'Portrait & Figurative', value: 'portrait' }
];

const COMPLEXITY_OPTIONS = [
  { label: 'Simple / Beginner', value: 'simple' },
  { label: 'Medium / Semi-Bridal', value: 'medium' },
  { label: 'Intricate / Heavy Detail', value: 'intricate' },
  { label: 'Masterpiece / Royal Heritage', value: 'masterpiece' }
];

const PLACEMENT_OPTIONS = [
  { id: 'front_hand', label: 'Front Palms' },
  { id: 'back_hand', label: 'Back Hand' },
  { id: 'full_arm', label: 'Full Arms to Elbow' },
  { id: 'feet', label: 'Feet & Ankles' },
  { id: 'legs', label: 'Legs to Knee' }
];

export const DesignForm = () => {
  const { designId } = useParams();
  const isEdit = Boolean(designId);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedDesignDetails, detailLoading, mutationLoading } = useSelector(
    (state) => state.designs
  );

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'bridal',
    subCategory: 'Full Hand to Elbow',
    description: '',
    tags: 'bridal, royal, wedding, portrait, intricate',
    price: 15000,
    discountedPrice: 12999,
    estimatedTime: '4-5 hours',
    complexity: 'masterpiece',
    placement: ['front_hand', 'back_hand', 'full_arm'],
    showInReelFeed: true,
    isPublished: true,
    isFeatured: true,
    isTrending: false,
    imageUrls: '',
    videoUrl: ''
  });

  // Media files state
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // Load existing data in edit mode
  useEffect(() => {
    if (isEdit && designId) {
      dispatch(fetchDesignDetails(designId));
    }
    return () => {
      dispatch(clearDesignDetails());
    };
  }, [dispatch, isEdit, designId]);

  useEffect(() => {
    if (isEdit && selectedDesignDetails?.design) {
      const d = selectedDesignDetails.design;
      setFormData({
        title: d.title || '',
        category: d.category || 'bridal',
        subCategory: d.subCategory || '',
        description: d.description || '',
        tags: Array.isArray(d.tags) ? d.tags.join(', ') : d.tags || '',
        price: d.price ?? 15000,
        discountedPrice: d.discountedPrice ?? 12999,
        estimatedTime: d.estimatedTime || '4-5 hours',
        complexity: d.complexity || 'masterpiece',
        placement: Array.isArray(d.placement) ? d.placement : ['front_hand', 'back_hand'],
        showInReelFeed: Boolean(d.showInReelFeed),
        isPublished: d.isPublished !== undefined ? Boolean(d.isPublished) : true,
        isFeatured: Boolean(d.isFeatured),
        isTrending: Boolean(d.isTrending),
        imageUrls: '',
        videoUrl: d.video?.url || ''
      });
      if (d.coverImage) setCoverPreview(d.coverImage);
      if (d.images && d.images.length > 0) {
        setAdditionalPreviews(d.images.map((img) => img.url).filter(Boolean));
      }
      if (d.video?.url) setVideoPreview(d.video.url);
    }
  }, [isEdit, selectedDesignDetails]);

  // Cover Dropzone
  const onCoverDrop = useCallback((accepted) => {
    const file = accepted[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      toast.success('Cover image selected');
    }
  }, []);

  const { getRootProps: getCoverRoot, getInputProps: getCoverInput, isDragActive: isCoverDrag } =
    useDropzone({
      onDrop: onCoverDrop,
      accept: { 'image/*': [] },
      maxFiles: 1
    });

  // Additional Images Dropzone
  const onImagesDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      setAdditionalFiles((prev) => [...prev, ...accepted]);
      const newPreviews = accepted.map((f) => URL.createObjectURL(f));
      setAdditionalPreviews((prev) => [...prev, ...newPreviews]);
      toast.success(`${accepted.length} artwork images added`);
    }
  }, []);

  const { getRootProps: getImagesRoot, getInputProps: getImagesInput, isDragActive: isImagesDrag } =
    useDropzone({
      onDrop: onImagesDrop,
      accept: { 'image/*': [] },
      multiple: true
    });

  // Video Dropzone
  const onVideoDrop = useCallback((accepted) => {
    const file = accepted[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      toast.success('Reel video selected');
    }
  }, []);

  const { getRootProps: getVideoRoot, getInputProps: getVideoInput, isDragActive: isVideoDrag } =
    useDropzone({
      onDrop: onVideoDrop,
      accept: { 'video/*': [] },
      maxFiles: 1
    });

  const handleTogglePlacement = (val) => {
    setFormData((prev) => {
      const current = prev.placement || [];
      if (current.includes(val)) {
        return { ...prev, placement: current.filter((p) => p !== val) };
      } else {
        return { ...prev, placement: [...current, val] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Design title is required');
      return;
    }

    if (!isEdit && !coverFile && !formData.imageUrls && !coverPreview) {
      toast.error('Please upload a cover image or provide an image URL');
      return;
    }

    // Build FormData payload
    const form = new FormData();
    form.append('title', formData.title.trim());
    form.append('category', formData.category);
    form.append('subCategory', formData.subCategory);
    form.append('description', formData.description);
    form.append('tags', formData.tags);
    form.append('price', String(formData.price || 0));
    form.append('discountedPrice', String(formData.discountedPrice || 0));
    form.append('estimatedTime', formData.estimatedTime);
    form.append('complexity', formData.complexity);
    form.append('placement', formData.placement.join(', '));
    form.append('showInReelFeed', String(formData.showInReelFeed));
    form.append('isPublished', String(formData.isPublished));
    form.append('isFeatured', String(formData.isFeatured));
    form.append('isTrending', String(formData.isTrending));

    // Cover image
    if (coverFile) {
      form.append('cover', coverFile);
    }

    // Additional images
    if (additionalFiles.length > 0) {
      additionalFiles.forEach((file) => {
        form.append('images', file);
      });
    }

    // Direct Image URLs
    if (formData.imageUrls.trim()) {
      form.append('imageUrls', formData.imageUrls.trim());
    }

    // Video
    if (videoFile) {
      form.append('video', videoFile);
    } else if (formData.videoUrl.trim()) {
      form.append('videoUrl', formData.videoUrl.trim());
    }

    try {
      if (isEdit) {
        await dispatch(updateDesign({ designId, data: form })).unwrap();
        toast.success(`Design "${formData.title}" updated successfully!`);
      } else {
        await dispatch(createDesign(form)).unwrap();
        toast.success(`Design "${formData.title}" created successfully!`);
      }
      navigate('/designs');
    } catch (err) {
      toast.error(err || 'Failed to save design');
    }
  };

  if (isEdit && detailLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
        <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">
          Loading Design Details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/designs')}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 transition-colors shadow-sm"
            title="Back to Designs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Portfolio Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white">
              {isEdit ? 'Edit Mehndi Artwork' : 'Publish New Artwork Design'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/designs')}
            className="px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={mutationLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md shadow-amber-800/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {mutationLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Artwork...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? 'Update Artwork' : 'Publish to Portfolio'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            Basic Artwork Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Artwork Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Royal Marwar Bridal Mehndi Masterpiece"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500 font-medium text-stone-900 dark:text-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Primary Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500 text-stone-900 dark:text-white"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Sub-Category / Style
              </label>
              <input
                type="text"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                placeholder="e.g. Full Hand to Elbow, Dhol & Shehnai"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500 text-stone-900 dark:text-white"
              />
            </div>

            {/* Complexity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Complexity Level
              </label>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500 text-stone-900 dark:text-white"
              >
                {COMPLEXITY_OPTIONS.map((comp) => (
                  <option key={comp.value} value={comp.value}>
                    {comp.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Time */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Estimated Application Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  placeholder="e.g. 4-5 hours"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500 text-stone-900 dark:text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Design Story & Client Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ultra intricate Rajasthani Marwar bridal mehndi featuring traditional dulha-dulhan portrait, peacock motifs..."
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500 text-stone-900 dark:text-white leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Tags (Comma-separated for search & filtering)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="bridal, marwari, portrait, wedding, dulha-dulhan, intricate"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500 text-stone-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Placements */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            Pricing & Body Placements
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Standard Price */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Standard Price (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm font-bold text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Discounted Price */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Discounted / Offer Price (₹)
              </label>
              <input
                type="number"
                value={formData.discountedPrice}
                onChange={(e) =>
                  setFormData({ ...formData, discountedPrice: Number(e.target.value) })
                }
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Placements */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-2">
                Applicable Body Placements
              </label>
              <div className="flex flex-wrap gap-2.5">
                {PLACEMENT_OPTIONS.map((opt) => {
                  const isChecked = formData.placement.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleTogglePlacement(opt.id)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                        isChecked
                          ? 'bg-amber-700 text-white shadow-md shadow-amber-800/20'
                          : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${isChecked ? 'opacity-100' : 'opacity-30'}`}
                      />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Media Uploads (Cover, Images, Video) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            Media & Visual Assets
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Cover Image Dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                Primary Cover Photo *
              </label>

              <div
                {...getCoverRoot()}
                className={`border-2 border-dashed rounded-3xl p-5 text-center cursor-pointer transition-all ${
                  isCoverDrag
                    ? 'border-amber-500 bg-amber-50 dark:bg-zinc-800'
                    : 'border-stone-300 dark:border-zinc-700 hover:border-amber-500 bg-stone-50 dark:bg-zinc-800/40'
                }`}
              >
                <input {...getCoverInput()} />
                {coverPreview ? (
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 mx-auto">
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Click to Replace Cover
                    </div>
                  </div>
                ) : (
                  <div className="py-8 space-y-2">
                    <UploadCloud className="w-10 h-10 mx-auto text-amber-600" />
                    <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      Upload High-Res Cover Image
                    </p>
                    <p className="text-[11px] text-stone-400">PNG, JPG, WEBP (Up to 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Video Dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                Artwork Video / Reel Clip
              </label>

              <div
                {...getVideoRoot()}
                className={`border-2 border-dashed rounded-3xl p-5 text-center cursor-pointer transition-all ${
                  isVideoDrag
                    ? 'border-purple-500 bg-purple-50 dark:bg-zinc-800'
                    : 'border-stone-300 dark:border-zinc-700 hover:border-purple-500 bg-stone-50 dark:bg-zinc-800/40'
                }`}
              >
                <input {...getVideoInput()} />
                {videoPreview ? (
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black mx-auto flex items-center justify-center">
                    <video src={videoPreview} controls className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="py-8 space-y-2">
                    <Film className="w-10 h-10 mx-auto text-purple-600" />
                    <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      Upload Mehndi Video / Reel (.mp4)
                    </p>
                    <p className="text-[11px] text-stone-400">Automatically feeds into video gallery</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Multi Images Dropzone */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Additional Gallery Angles & Photos
            </label>

            <div
              {...getImagesRoot()}
              className={`border-2 border-dashed rounded-3xl p-5 text-center cursor-pointer transition-all ${
                isImagesDrag
                  ? 'border-amber-500 bg-amber-50 dark:bg-zinc-800'
                  : 'border-stone-300 dark:border-zinc-700 hover:border-amber-500 bg-stone-50 dark:bg-zinc-800/40'
              }`}
            >
              <input {...getImagesInput()} />
              <div className="py-4 space-y-1">
                <UploadCloud className="w-8 h-8 mx-auto text-stone-400" />
                <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Drop additional angle photos here or click to browse
                </p>
                <p className="text-[11px] text-stone-400">Multiple images supported</p>
              </div>
            </div>

            {additionalPreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {additionalPreviews.map((prev, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 ring-1 ring-stone-200 group"
                  >
                    <img src={prev} alt="Extra" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct URL Fallbacks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-stone-100 dark:border-zinc-800 text-xs">
            <div>
              <label className="block font-bold text-stone-500 dark:text-stone-400 mb-1">
                External Image URLs (Comma-separated CDN URLs)
              </label>
              <input
                type="text"
                value={formData.imageUrls}
                onChange={(e) => setFormData({ ...formData, imageUrls: e.target.value })}
                placeholder="https://images.unsplash.com/..., https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-500 dark:text-stone-400 mb-1">
                External Video URL (CDN / Cloudinary direct URL)
              </label>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://assets.mixkit.co/.../large.mp4"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Visibility & Feed Switches */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            Publication & Display Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Show in Reel Feed */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200/60 dark:border-zinc-700 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-white">
                  Show in Reel / Video Feed
                </p>
                <p className="text-[11px] text-stone-400">
                  Feature design video in user mobile reel swipe feed
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.showInReelFeed}
                onChange={(e) => setFormData({ ...formData, showInReelFeed: e.target.checked })}
                className="w-5 h-5 rounded text-amber-700 focus:ring-amber-500 accent-amber-700 cursor-pointer"
              />
            </label>

            {/* Published */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200/60 dark:border-zinc-700 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-white">Live Published</p>
                <p className="text-[11px] text-stone-400">Make artwork visible on client portal</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-5 h-5 rounded text-amber-700 focus:ring-amber-500 accent-amber-700 cursor-pointer"
              />
            </label>

            {/* Featured */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200/60 dark:border-zinc-700 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-white">
                  Featured on Home Showcase
                </p>
                <p className="text-[11px] text-stone-400">Pin to top trending carousel</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-5 h-5 rounded text-amber-700 focus:ring-amber-500 accent-amber-700 cursor-pointer"
              />
            </label>

            {/* Trending */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200/60 dark:border-zinc-700 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-white">Trending Badge</p>
                <p className="text-[11px] text-stone-400">Highlight with "Trending Now" ribbon</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isTrending}
                onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                className="w-5 h-5 rounded text-amber-700 focus:ring-amber-500 accent-amber-700 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/designs')}
            className="px-5 py-3 rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutationLoading}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-amber-800/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {mutationLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Artwork...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? 'Save Changes' : 'Publish Artwork Now'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DesignForm;
