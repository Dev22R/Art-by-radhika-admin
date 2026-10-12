import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Sparkles,
  Heart,
  Eye,
  CalendarCheck,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Film,
  Clock,
  Tag,
  MapPin,
  IndianRupee,
  Share2,
  ExternalLink,
  Layers,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import {
  fetchDesignDetails,
  togglePublishDesign,
  toggleReelFeed,
  deleteDesign,
  clearDesignDetails
} from '../redux/slices/designsSlice';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'sonner';

export const DesignDetail = () => {
  const { designId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedDesignDetails, detailLoading, detailError } = useSelector(
    (state) => state.designs
  );

  const [activeMediaIndex, setActiveMediaIndex] = useState(0); // 0 = cover, >0 = images, 'video' = video
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'delete'
    isLoading: false
  });

  useEffect(() => {
    if (designId) {
      dispatch(fetchDesignDetails(designId));
    }
    return () => {
      dispatch(clearDesignDetails());
    };
  }, [dispatch, designId]);

  const design = selectedDesignDetails?.design;
  const analytics = selectedDesignDetails?.analytics || {
    views: design?.viewCount || 0,
    likes: design?.likeCount || 0,
    bookings: design?.bookingCount || 0
  };
  const likedByUsers = selectedDesignDetails?.likedByUsers || [];
  const relatedBookings = selectedDesignDetails?.relatedBookings || [];

  const handleTogglePublish = async () => {
    if (!design) return;
    try {
      await dispatch(togglePublishDesign(design._id)).unwrap();
      toast.success(
        `Design is now ${!design.isPublished ? 'Published (Live)' : 'Unpublished (Draft)'}`
      );
      dispatch(fetchDesignDetails(designId));
    } catch (err) {
      toast.error(err || 'Failed to toggle publish status');
    }
  };

  const handleToggleReelFeed = async () => {
    if (!design) return;
    try {
      await dispatch(toggleReelFeed(design._id)).unwrap();
      toast.success(
        `Reel feed display ${!design.showInReelFeed ? 'Enabled' : 'Disabled'}`
      );
      dispatch(fetchDesignDetails(designId));
    } catch (err) {
      toast.error(err || 'Failed to update reel feed status');
    }
  };

  const handleOpenDeleteModal = () => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      isLoading: false
    });
  };

  const handleCloseConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!design) return;
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await dispatch(deleteDesign(design._id)).unwrap();
      toast.success(`Design "${design.title}" deleted successfully.`);
      navigate('/designs');
    } catch (err) {
      toast.error(err || 'Failed to delete design');
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  if (detailLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
        <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">
          Loading Design Details...
        </p>
      </div>
    );
  }

  if (detailError || !design) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-sm mt-6">
        <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white">
          Artwork Not Found
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {detailError || 'Unable to retrieve design details from the server.'}
        </p>
        <button
          onClick={() => navigate('/designs')}
          className="px-5 py-2.5 rounded-2xl bg-amber-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </button>
      </div>
    );
  }

  // Gallery items assembly
  const gallery = [];
  if (design.coverImage) {
    gallery.push({ type: 'image', url: design.coverImage, label: 'Cover' });
  }
  if (design.images && design.images.length > 0) {
    design.images.forEach((img, idx) => {
      if (img.url && img.url !== design.coverImage) {
        gallery.push({ type: 'image', url: img.url, label: `Angle #${idx + 1}` });
      }
    });
  }
  if (design.video?.url) {
    gallery.push({ type: 'video', url: design.video.url, label: 'Reel Video' });
  }

  const currentMedia = gallery[activeMediaIndex] || gallery[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/designs')}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 transition-colors shadow-sm"
            title="Back to All Designs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Design Artwork
              </span>
              <span className="text-stone-300 dark:text-zinc-700">•</span>
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                {design.designCode || 'BRI-0000'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white">
              {design.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Reel Feed Switch */}
          <button
            onClick={handleToggleReelFeed}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
              design.showInReelFeed
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200'
                : 'bg-stone-50 dark:bg-zinc-800 text-stone-500 border-stone-200 dark:border-zinc-700'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>{design.showInReelFeed ? 'In Reel Feed' : 'Hidden from Reels'}</span>
          </button>

          {/* Publish / Unpublish */}
          <button
            onClick={handleTogglePublish}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
              design.isPublished
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200'
            }`}
          >
            {design.isPublished ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{design.isPublished ? 'Published Live' : 'Draft Only'}</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => navigate(`/designs/edit/${design._id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md shadow-amber-800/20 transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Design</span>
          </button>

          {/* Delete */}
          <button
            onClick={handleOpenDeleteModal}
            className="p-2 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
            title="Delete Design"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Stage: Media Viewer & Carousel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-3 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            {/* Main Stage */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-950 flex items-center justify-center">
              {currentMedia?.type === 'video' ? (
                <video
                  src={currentMedia.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : currentMedia?.url ? (
                <img
                  src={currentMedia.url}
                  alt={design.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-stone-400 text-xs">No media preview available</div>
              )}

              {/* Design Code Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-stone-900/80 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/20">
                {design.designCode || 'BRI-001'}
              </div>

              {/* Category Badge */}
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-amber-700/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                {design.category}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                {gallery.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeMediaIndex === idx
                        ? 'border-amber-600 ring-2 ring-amber-500/40 scale-105'
                        : 'border-stone-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-stone-900 flex items-center justify-center text-purple-400">
                        <Film className="w-5 h-5" />
                      </div>
                    ) : (
                      <img src={item.url} alt="thumb" className="w-full h-full object-cover" />
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-white text-[9px] text-center font-semibold py-0.5">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Analytics Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-stone-400">Total Views</p>
                <p className="text-xl font-bold font-royal text-stone-900 dark:text-white">
                  {analytics.views || 0}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-stone-400">Total Likes</p>
                <p className="text-xl font-bold font-royal text-stone-900 dark:text-white">
                  {analytics.likes || 0}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-stone-400">Bookings</p>
                <p className="text-xl font-bold font-royal text-stone-900 dark:text-white">
                  {analytics.bookings || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info: Pricing, Details, Placements, Story (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Price & Primary Specs Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-stone-400">Price Estimate</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                  {design.complexity}
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-bold font-royal text-amber-800 dark:text-amber-400">
                  {formatCurrency(design.discountedPrice || design.price)}
                </span>
                {design.discountedPrice && design.discountedPrice < design.price && (
                  <span className="text-base text-stone-400 line-through font-semibold">
                    {formatCurrency(design.price)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100 dark:border-zinc-800 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px] font-bold uppercase">
                  Sub-Category
                </span>
                <span className="font-bold text-stone-800 dark:text-white">
                  {design.subCategory || 'Full Hand'}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[11px] font-bold uppercase">
                  Application Time
                </span>
                <span className="font-bold text-stone-800 dark:text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  {design.estimatedTime || '4-5 hours'}
                </span>
              </div>
            </div>

            {/* Placements */}
            {design.placement && design.placement.length > 0 && (
              <div className="pt-3 border-t border-stone-100 dark:border-zinc-800">
                <span className="text-stone-400 block text-[11px] font-bold uppercase mb-2">
                  Body Placements
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(design.placement)
                    ? design.placement
                    : String(design.placement).split(',')
                  ).map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300"
                    >
                      {p.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {design.description && (
              <div className="pt-3 border-t border-stone-100 dark:border-zinc-800">
                <span className="text-stone-400 block text-[11px] font-bold uppercase mb-1.5">
                  Artwork Story & Description
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {design.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {design.tags && design.tags.length > 0 && (
              <div className="pt-3 border-t border-stone-100 dark:border-zinc-800">
                <span className="text-stone-400 block text-[11px] font-bold uppercase mb-2">
                  Keywords & Search Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(design.tags)
                    ? design.tags
                    : String(design.tags).split(',')
                  ).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-amber-50 dark:bg-zinc-800 text-amber-800 dark:text-amber-300"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Creation Meta */}
            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-stone-400">
              <span>Created by: {design.createdBy?.name || 'Studio Admin'}</span>
              <span>Published: {formatDate(design.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        isLoading={confirmModal.isLoading}
        loadingText="Deleting artwork..."
        title="Delete Mehndi Design"
        description={`Are you sure you want to permanently delete "${design.title}"? It will be removed from customer gallery and booking catalog.`}
        confirmText="Delete Design"
        confirmVariant="danger"
        icon={Trash2}
      />
    </div>
  );
};

export default DesignDetail;
