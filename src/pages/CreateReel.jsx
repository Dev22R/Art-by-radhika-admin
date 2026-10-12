import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import {
  ArrowLeft,
  Film,
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  IndianRupee,
  Clock,
  Tag,
  CheckCircle2,
  X,
  Play,
  Save,
  AlertCircle,
  HelpCircle,
  Layers
} from 'lucide-react';
import { createReel } from '../redux/slices/reelsSlice';
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

export const CreateReel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutationLoading } = useSelector((state) => state.reels);

  // Reel State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('bridal, marwari, henna, royal, wedding');

  // Admin Design State
  const [designName, setDesignName] = useState('');
  const [category, setCategory] = useState('bridal');
  const [price, setPrice] = useState(15000);
  const [discountedPrice, setDiscountedPrice] = useState(12999);
  const [estimatedTime, setEstimatedTime] = useState('4-5 hours');
  const [isBookable, setIsBookable] = useState(true);
  const [designDescription, setDesignDescription] = useState('');

  // Media files state
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [designImageFiles, setDesignImageFiles] = useState([]);
  const [designImagePreviews, setDesignImagePreviews] = useState([]);

  // Video Dropzone
  const onVideoDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file (.mp4, .mov, .webm)');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      toast.success(`Video selected: ${file.name}`);
    }
  }, []);

  const {
    getRootProps: getVideoRootProps,
    getInputProps: getVideoInputProps,
    isDragActive: isVideoDragActive
  } = useDropzone({
    onDrop: onVideoDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.webm', '.mkv'] },
    maxFiles: 1
  });

  // Thumbnail Dropzone
  const onThumbnailDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      toast.success(`Thumbnail cover selected: ${file.name}`);
    }
  }, []);

  const {
    getRootProps: getThumbRootProps,
    getInputProps: getThumbInputProps,
    isDragActive: isThumbDragActive
  } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1
  });

  // Design Gallery Images Dropzone
  const onDesignImagesDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setDesignImageFiles((prev) => [...prev, ...acceptedFiles]);
      const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file));
      setDesignImagePreviews((prev) => [...prev, ...newPreviews]);
      toast.success(`${acceptedFiles.length} design photo(s) added`);
    }
  }, []);

  const {
    getRootProps: getDesignImagesRootProps,
    getInputProps: getDesignImagesInputProps,
    isDragActive: isDesignImagesDragActive
  } = useDropzone({
    onDrop: onDesignImagesDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: true
  });

  const removeDesignImage = (index) => {
    setDesignImageFiles((prev) => prev.filter((_, i) => i !== index));
    setDesignImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error('Reel video file is required. Please upload a video.');
      return;
    }

    if (!thumbnailFile) {
      toast.error('Thumbnail cover image is required for the video reel.');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title for the reel.');
      return;
    }

    const payloadName = designName.trim() || title.trim();

    // Build multipart/form-data
    const form = new FormData();
    form.append('video', videoFile);
    form.append('thumbnail', thumbnailFile);

    // Design Images
    designImageFiles.forEach((file) => {
      form.append('designImages', file);
    });

    form.append('title', title.trim());
    form.append('description', description.trim());
    form.append('tags', tags.trim());

    // adminDesign JSON string
    const adminDesignObj = {
      designName: payloadName,
      category,
      price: Number(price) || 0,
      discountedPrice: Number(discountedPrice) || 0,
      estimatedTime: estimatedTime.trim() || '3-4 hours',
      isBookable: Boolean(isBookable),
      description: designDescription.trim() || description.trim()
    };
    form.append('adminDesign', JSON.stringify(adminDesignObj));

    try {
      await dispatch(createReel(form)).unwrap();
      toast.success('Reel uploaded and published to showcase successfully!');
      navigate('/reels');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to upload reel');
    }
  };

  // Split tags into preview chips
  const tagsList = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/reels')}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 transition-colors shadow-sm cursor-pointer"
            title="Back to Reels"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Video Showcase Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white">
              Create & Upload Reel
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/reels')}
            className="px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={mutationLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-800/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {mutationLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading Reel Video...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Upload & Publish Reel</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Media Files (Video, Cover Thumbnail, Design Images) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Video File Upload */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-600" />
                  Reel Video (.mp4 / .mov) *
                </label>
                {videoFile && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                )}
              </div>

              <div
                {...getVideoRootProps()}
                className={`border-2 border-dashed rounded-3xl p-4 text-center cursor-pointer transition-all ${
                  isVideoDragActive
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-zinc-800'
                    : 'border-stone-300 dark:border-zinc-700 hover:border-amber-500 bg-stone-50 dark:bg-zinc-800/40'
                }`}
              >
                <input {...getVideoInputProps()} />
                {videoPreview ? (
                  <div className="relative aspect-[9/14] max-h-96 mx-auto rounded-2xl overflow-hidden bg-black flex items-center justify-center group">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white px-2.5 py-1 rounded-xl text-[11px] font-bold backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to Replace
                    </div>
                  </div>
                ) : (
                  <div className="py-10 space-y-2.5">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-inner">
                      <Film className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        Drop your 9:16 vertical video here
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        MP4, MOV, WEBM (Optimal: 1080x1920)
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-xl bg-white dark:bg-zinc-700 text-stone-600 dark:text-stone-300 text-[11px] font-bold shadow-sm">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Cover Thumbnail Upload */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                Thumbnail Cover Image *
              </label>

              <div
                {...getThumbRootProps()}
                className={`border-2 border-dashed rounded-3xl p-4 text-center cursor-pointer transition-all ${
                  isThumbDragActive
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-zinc-800'
                    : 'border-stone-300 dark:border-zinc-700 hover:border-amber-500 bg-stone-50 dark:bg-zinc-800/40'
                }`}
              >
                <input {...getThumbInputProps()} />
                {thumbnailPreview ? (
                  <div className="relative aspect-[9/12] max-h-64 mx-auto rounded-2xl overflow-hidden bg-black/5 group">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Click to Replace Thumbnail
                    </div>
                  </div>
                ) : (
                  <div className="py-6 space-y-2">
                    <UploadCloud className="w-9 h-9 mx-auto text-stone-400" />
                    <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      Upload Reel Cover Thumbnail
                    </p>
                    <p className="text-[11px] text-stone-400">
                      High-resolution PNG, JPG, WEBP
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Design Artwork Gallery Images */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  Design Photos (`designImages`)
                </label>
                <span className="text-[11px] text-stone-400">
                  {designImageFiles.length} Photos
                </span>
              </div>

              <div
                {...getDesignImagesRootProps()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                  isDesignImagesDragActive
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-zinc-800'
                    : 'border-stone-300 dark:border-zinc-700 hover:border-amber-500 bg-stone-50 dark:bg-zinc-800/40'
                }`}
              >
                <input {...getDesignImagesInputProps()} />
                <div className="py-3 space-y-1">
                  <UploadCloud className="w-7 h-7 mx-auto text-stone-400" />
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Add Design Photos for Client Booking
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Multiple photos shown when user clicks book design
                  </p>
                </div>
              </div>

              {designImagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-2">
                  {designImagePreviews.map((prev, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 ring-1 ring-stone-200 dark:ring-zinc-700 group"
                    >
                      <img
                        src={prev}
                        alt={`Design extra ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDesignImage(idx);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Reel Information & Bookable Admin Design */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section A: Reel Information */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-zinc-800">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white">
                  Reel Video Information
                </h2>
              </div>

              {/* Reel Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                  Reel Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Royal Marwar Bridal Mehndi Video Showcase"
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm font-medium text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                  Reel Caption & Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Exquisite slow-motion close-up of intricate marwari henna details..."
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                  Search & Trending Tags (Comma-separated)
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="bridal, marwari, henna, royal, wedding"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                {tagsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {tagsList.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section B: Linked Admin Design Details (`adminDesign`) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white">
                    Bookable Artwork Design (`adminDesign`)
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Client Booking Link
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Design Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                    Design Name *
                  </label>
                  <input
                    type="text"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder={title || 'Royal Marwar Bridal Showcase'}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm font-medium text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Defaults to reel title if left blank
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                    Design Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
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
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder="e.g. 4-5 hours"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Standard Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                    Standard Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm font-bold text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Discounted Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                    Offer / Discounted Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Is Bookable Toggle */}
                <div className="sm:col-span-2">
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/80 border border-stone-200/80 dark:border-zinc-700 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white">
                        Enable Direct Client Booking (`isBookable`)
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Clients watching this reel can click "Book This Design" directly from mobile app
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isBookable}
                      onChange={(e) => setIsBookable(e.target.checked)}
                      className="w-5 h-5 rounded text-amber-700 focus:ring-amber-500 accent-amber-700 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Design Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                    Design Detail / Package Inclusions
                  </label>
                  <textarea
                    rows={2}
                    value={designDescription}
                    onChange={(e) => setDesignDescription(e.target.value)}
                    placeholder="Includes both palms to elbow, bridal dulha-dulhan portrait, customized initials..."
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/reels')}
                className="px-5 py-3 rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
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
                    <span>Uploading Reel Video...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Upload & Publish Reel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateReel;
