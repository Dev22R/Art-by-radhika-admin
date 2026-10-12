import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Film,
  Eye,
  EyeOff,
  Heart,
  MessageCircle,
  Share2,
  BookmarkCheck,
  Calendar,
  Clock,
  Tag,
  IndianRupee,
  Sparkles,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Monitor,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Info,
  Users,
  Copy,
  Check
} from 'lucide-react';
import {
  fetchReelDetails,
  updateReel,
  togglePublishReel,
  deleteReel,
  deleteReelComment,
  clearReelDetails
} from '../redux/slices/reelsSlice';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { toast } from 'sonner';

export const ReelDetail = () => {
  const { reelId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selectedReelDetails,
    selectedReel,
    detailLoading,
    detailError,
    mutationLoading
  } = useSelector((state) => state.reels);

  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'viewers' | 'likes' | 'shares'
  const [viewersType, setViewersType] = useState('registered'); // 'registered' | 'anonymous'
  const [activeImagePreview, setActiveImagePreview] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedIp, setCopiedIp] = useState(null);

  // Helper to parse device info from userAgent
  const parseDeviceInfo = (userAgent) => {
    if (!userAgent) return { os: 'Unknown OS', browser: 'Browser', isMobile: false, label: 'Unknown Device' };
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    let os = 'Desktop';
    if (/Android 10/i.test(userAgent)) os = 'Android 10';
    else if (/Android/i.test(userAgent)) os = 'Android';
    else if (/iPhone/i.test(userAgent)) os = 'iOS (iPhone)';
    else if (/iPad/i.test(userAgent)) os = 'iPadOS';
    else if (/Windows NT 10.0/i.test(userAgent)) os = 'Windows 10/11';
    else if (/Windows/i.test(userAgent)) os = 'Windows';
    else if (/Macintosh|Mac OS/i.test(userAgent)) os = 'macOS';
    else if (/Linux/i.test(userAgent)) os = 'Linux';

    let browser = 'Browser';
    if (/Edg/i.test(userAgent)) browser = 'Edge';
    else if (/Chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/Safari/i.test(userAgent)) browser = 'Safari';
    else if (/Firefox/i.test(userAgent)) browser = 'Firefox';

    return {
      os,
      browser,
      isMobile,
      label: `${os} • ${browser}`
    };
  };

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteReelOpen, setIsDeleteReelOpen] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    tags: '',
    designName: '',
    category: 'bridal',
    price: 15000,
    discountedPrice: 12999,
    estimatedTime: '4-5 hours',
    isBookable: true
  });

  // Fetch reel details via GET /reels/admin/:reelId/details
  useEffect(() => {
    if (reelId) {
      dispatch(fetchReelDetails(reelId));
    }
    return () => {
      dispatch(clearReelDetails());
    };
  }, [dispatch, reelId]);

  // Extract from selectedReelDetails (or fallback to selectedReel)
  const reel = selectedReelDetails?.reel || selectedReel;
  const analytics = selectedReelDetails?.analytics || {
    totalViews: reel?.viewCount ?? 0,
    uniqueViews: reel?.uniqueViewCount ?? 0,
    totalLikes: reel?.likeCount ?? 0,
    totalComments: reel?.commentCount ?? 0,
    totalShares: reel?.shareCount ?? 0,
    totalBookings: reel?.bookingCount ?? 0
  };
  const engagement = selectedReelDetails?.engagementDetails || {};
  const likedByUsers = engagement.likedByUsers || [];
  const commentsList = engagement.comments || reel?.comments || [];
  const viewersData = engagement.viewers || {
    registeredCount: 0,
    anonymousCount: 0,
    registeredViewers: [],
    anonymousViewers: []
  };
  const registeredViewers = viewersData.registeredViewers || [];
  const anonymousViewers = viewersData.anonymousViewers || [];
  const sharesList = engagement.shares || reel?.shares || [];
  const bookingsList = engagement.bookings || [];

  // Sync edit form when reel data is available
  useEffect(() => {
    if (reel) {
      setEditForm({
        title: reel.title || '',
        description: reel.description || '',
        tags: Array.isArray(reel.tags) ? reel.tags.join(', ') : reel.tags || '',
        designName: reel.adminDesign?.designName || reel.title || '',
        category: reel.adminDesign?.category || 'bridal',
        price: reel.adminDesign?.price ?? 15000,
        discountedPrice: reel.adminDesign?.discountedPrice ?? 12999,
        estimatedTime: reel.adminDesign?.estimatedTime || '4-5 hours',
        isBookable:
          reel.adminDesign?.isBookable !== undefined
            ? Boolean(reel.adminDesign?.isBookable)
            : true
      });
    }
  }, [reel]);

  const handleCopyPublicId = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success('Public ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyIp = (ip) => {
    if (!ip) return;
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    toast.success(`IP address ${ip} copied`);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleTogglePublish = async () => {
    if (!reel) return;
    try {
      const res = await dispatch(togglePublishReel(reel._id || reel.id)).unwrap();
      const statusText = res.isPublished ? 'Published' : 'Draft';
      toast.success(`Reel status updated to ${statusText}`);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update publish status');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!reel) return;

    const tagsArray = editForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      tags: tagsArray,
      adminDesign: {
        designName: editForm.designName.trim() || editForm.title.trim(),
        category: editForm.category,
        price: Number(editForm.price) || 0,
        discountedPrice: Number(editForm.discountedPrice) || 0,
        estimatedTime: editForm.estimatedTime.trim(),
        isBookable: Boolean(editForm.isBookable)
      }
    };

    try {
      await dispatch(
        updateReel({
          reelId: reel._id || reel.id,
          data: payload
        })
      ).unwrap();
      toast.success('Reel details updated successfully!');
      setIsEditModalOpen(false);
      dispatch(fetchReelDetails(reelId));
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update reel');
    }
  };

  const handleConfirmDeleteReel = async () => {
    if (!reel) return;
    try {
      await dispatch(deleteReel(reel._id || reel.id)).unwrap();
      toast.success('Reel deleted successfully');
      navigate('/reels');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to delete reel');
    }
  };

  const handleConfirmDeleteComment = async () => {
    if (!deletingComment || !reel) return;
    try {
      await dispatch(
        deleteReelComment({
          reelId: reel._id || reel.id,
          commentId: deletingComment.commentId
        })
      ).unwrap();
      toast.success('Comment deleted successfully');
      setDeletingComment(null);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to delete comment');
    }
  };

  if (detailLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
        <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">
          Loading Reel Showcase & Audience Analytics...
        </p>
      </div>
    );
  }

  if (detailError || !reel) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-sm mt-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
          <Film className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white">
          Reel Not Found
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {detailError || 'Unable to retrieve reel details from the server.'}
        </p>
        <button
          onClick={() => navigate('/reels')}
          className="px-5 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md inline-flex items-center gap-2 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reels Showcase
        </button>
      </div>
    );
  }

  const isPublished = reel.isPublished || reel.status === 'published';
  const videoUrl = reel.video?.url || reel.videoUrl;
  const thumbnailUrl = reel.thumbnail?.url || reel.thumbnail;
  const design = reel.adminDesign || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* 1. Header Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reels')}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 transition-colors shadow-sm cursor-pointer"
            title="Back to Reels"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Reel Studio Details
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isPublished
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {isPublished ? 'Published' : 'Draft'}
              </span>
              {design.category && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                  {design.category}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white mt-0.5">
              {reel.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Toggle Publish */}
          <button
            onClick={handleTogglePublish}
            disabled={mutationLoading}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
              isPublished
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            {isPublished ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span>{isPublished ? 'Live Published' : 'Draft (Unpublished)'}</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-700 dark:text-stone-200 text-xs font-bold shadow-sm cursor-pointer transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => setIsDeleteReelOpen(true)}
            className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
            title="Delete Reel"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top KPI Analytics Strip (from API analytics object) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Views */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Views</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {analytics.totalViews ?? 0}
          </p>
          <span className="text-[10px] text-stone-400">
            {analytics.uniqueViews ?? 0} unique viewers
          </span>
        </div>

        {/* Total Likes */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Likes</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {analytics.totalLikes ?? 0}
          </p>
          <span className="text-[10px] text-stone-400">
            {likedByUsers.length} user likes
          </span>
        </div>

        {/* Total Comments */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Comments</span>
            <MessageCircle className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {analytics.totalComments ?? 0}
          </p>
          <span className="text-[10px] text-stone-400">
            {commentsList.length} feedback
          </span>
        </div>

        {/* Total Shares */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Shares</span>
            <Share2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {analytics.totalShares ?? 0}
          </p>
          <span className="text-[10px] text-stone-400">Social shares</span>
        </div>

        {/* Total Bookings */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bookings</span>
            <BookmarkCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {analytics.totalBookings ?? 0}
          </p>
          <span className="text-[10px] text-stone-400">Direct clients</span>
        </div>

        {/* Registered Viewers vs Anonymous */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Audience</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {viewersData.registeredCount ?? 0}
          </p>
          <span className="text-[10px] text-stone-400">
            +{viewersData.anonymousCount ?? 0} anonymous
          </span>
        </div>
      </div>

      {/* 3. Main Split View: Left Column Player & Specs + Right Column Content & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Vertical Video Player, Specs & Creator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vertical Reel Player Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-600" />
                9:16 Vertical HD Video Stream
              </span>
              <span className="text-[11px] font-semibold text-stone-400">
                {reel.video?.duration ? `${reel.video.duration}s` : 'HD Reel'}
              </span>
            </div>

            {/* Video Player */}
            <div className="relative aspect-[9/15] max-h-[580px] w-full rounded-2xl overflow-hidden bg-black mx-auto shadow-2xl shadow-black/40 flex items-center justify-center border border-stone-800">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  poster={thumbnailUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <div className="text-stone-400 text-xs p-6 text-center">
                  Video stream unavailable
                </div>
              )}
            </div>

            {/* Technical Video Meta Badges from Cloudinary */}
            {reel.video && (
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700/60 space-y-2 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">
                      Format
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200 uppercase">
                      {reel.video.format || 'MP4'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">
                      Resolution
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {reel.video.width && reel.video.height
                        ? `${reel.video.width}x${reel.video.height}`
                        : 'Vertical HD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">
                      Size
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {reel.video.bytes
                        ? `${(reel.video.bytes / (1024 * 1024)).toFixed(1)} MB`
                        : 'Optimized'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">
                      Duration
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {reel.video.duration ? `${reel.video.duration}s` : 'HD Reel'}
                    </span>
                  </div>
                </div>

                {reel.video.publicId && (
                  <div className="pt-2 border-t border-stone-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="truncate max-w-[240px] font-mono text-[10px]">
                      {reel.video.publicId}
                    </span>
                    <button
                      onClick={() => handleCopyPublicId(reel.video.publicId)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer shrink-0"
                    >
                      {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail Cover Image Card */}
          {thumbnailUrl && (
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Cover Thumbnail Image
              </span>
              <div className="relative aspect-[9/12] max-h-56 rounded-2xl overflow-hidden bg-stone-100 ring-1 ring-stone-200 dark:ring-zinc-700">
                <img
                  src={thumbnailUrl}
                  alt={reel.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Publisher & Metadata Info */}
          {reel.createdBy && (
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Publisher Credentials
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold font-royal">
                  {reel.createdBy.name?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate">
                    {reel.createdBy.name || 'Art By Radhika Admin'}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 truncate flex-wrap">
                    <span>{reel.createdBy.email || 'admin@artbyradhika.com'}</span>
                    {reel.createdBy.phone && <span>• {reel.createdBy.phone}</span>}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 text-[11px] text-stone-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Published At:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {reel.publishedAt ? new Date(reel.publishedAt).toLocaleString() : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Created At:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {reel.createdAt ? new Date(reel.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Reel Details, Bookable Design & Engagement Analytics Tabs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Reel Caption & Story */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
              <h3 className="text-base font-bold font-royal text-stone-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Reel Caption & Hashtags
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
              {reel.description || 'No caption provided.'}
            </p>

            {/* Tags Chips */}
            {Array.isArray(reel.tags) && reel.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {reel.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-zinc-800 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-zinc-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Linked Admin Design Section (`adminDesign`) */}
          {design && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-base font-bold font-royal text-stone-900 dark:text-white">
                    Bookable Henna Design ({design.designName || reel.title})
                  </h3>
                </div>
                {design.designCode && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    Code: {design.designCode}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">
                    Category
                  </span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">
                    {design.category || 'Bridal'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">
                    Est. Time
                  </span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {design.estimatedTime || '4-5 hours'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">
                    Standard Price
                  </span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    ₹{design.price || 0}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">
                    Offer Price
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{design.discountedPrice || design.price || 0}
                  </span>
                </div>
              </div>

              {design.price && design.discountedPrice && design.price > design.discountedPrice && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl w-fit">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    Offer Savings: ₹{(design.price - design.discountedPrice).toLocaleString()} (
                    {Math.round(((design.price - design.discountedPrice) / design.price) * 100)}% Discount)
                  </span>
                </div>
              )}

              {design.description && (
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {design.description}
                </p>
              )}

              {/* Design Photos Gallery (`design.images`) */}
              {Array.isArray(design.images) && design.images.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Design Artwork Photos ({design.images.length})
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                    {design.images.map((imgUrl, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveImagePreview(imgUrl)}
                        className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 ring-1 ring-stone-200 dark:ring-zinc-700 cursor-pointer group"
                      >
                        <img
                          src={imgUrl}
                          alt={`Design artwork ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                thumbnailUrl && (
                  <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Artwork preview featured in main reel video & cover
                    </span>
                    <button
                      onClick={() => setActiveImagePreview(thumbnailUrl)}
                      className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Enlarge Cover Photo
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {/* 4. Deep Audience Engagement Tabs (Comments, Registered/Anon Viewers, Likes, Shares) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            {/* Tab navigation */}
            <div className="flex items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'comments'
                    ? 'bg-amber-700 text-white shadow-md shadow-amber-800/20'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Comments ({commentsList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('viewers')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'viewers'
                    ? 'bg-amber-700 text-white shadow-md shadow-amber-800/20'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  Viewer Retention ({viewersData.registeredCount + viewersData.anonymousCount})
                </span>
              </button>

              <button
                onClick={() => setActiveTab('likes')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'likes'
                    ? 'bg-amber-700 text-white shadow-md shadow-amber-800/20'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Likes ({likedByUsers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('shares')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'shares'
                    ? 'bg-amber-700 text-white shadow-md shadow-amber-800/20'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Shares ({sharesList.length})</span>
              </button>
            </div>

            {/* TAB CONTENT 1: Comments */}
            {activeTab === 'comments' && (
              <div className="space-y-3">
                {commentsList.length === 0 ? (
                  <p className="text-xs text-stone-400 py-8 text-center">
                    No comments submitted yet for this reel.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {commentsList.map((c) => {
                      const userObj = c.user || {};
                      return (
                        <div
                          key={c._id}
                          className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700/60 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {userObj.profileImage ? (
                              <img
                                src={userObj.profileImage}
                                alt={userObj.name || 'User'}
                                className="w-9 h-9 rounded-2xl object-cover shrink-0 ring-1 ring-stone-200 dark:ring-zinc-700"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center shrink-0">
                                {userObj.name?.charAt(0) || 'U'}
                              </div>
                            )}

                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-stone-900 dark:text-white">
                                  {userObj.name || 'Client User'}
                                </span>
                                {userObj.phone && (
                                  <span className="text-[10px] text-stone-400">
                                    • {userObj.phone}
                                  </span>
                                )}
                                {c.createdAt && (
                                  <span className="text-[10px] text-stone-400">
                                    • {new Date(c.createdAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-stone-700 dark:text-stone-300 leading-relaxed break-words font-medium text-xs sm:text-sm">
                                {c.text}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              setDeletingComment({
                                commentId: c._id,
                                commentText: c.text
                              })
                            }
                            className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                            title="Delete Comment (Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: Viewers Log & Retention (Registered & Anonymous) */}
            {activeTab === 'viewers' && (
              <div className="space-y-4">
                {/* Sub-tabs for Viewers */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewersType('registered')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      viewersType === 'registered'
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300/40'
                        : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Registered Clients ({viewersData.registeredCount ?? registeredViewers.length})
                  </button>
                  <button
                    onClick={() => setViewersType('anonymous')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      viewersType === 'anonymous'
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300/40'
                        : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Anonymous Viewers ({viewersData.anonymousCount ?? anonymousViewers.length})
                  </button>
                </div>

                {viewersType === 'registered' ? (
                  registeredViewers.length === 0 ? (
                    <p className="text-xs text-stone-400 py-8 text-center">
                      No registered client views recorded yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 dark:bg-zinc-800/80 text-[10px] uppercase font-bold text-stone-500 sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3 rounded-l-xl">User Profile</th>
                            <th className="py-2.5 px-3">Device / Browser</th>
                            <th className="py-2.5 px-3">Watch Duration</th>
                            <th className="py-2.5 px-3">IP Address</th>
                            <th className="py-2.5 px-3 rounded-r-xl">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 text-stone-700 dark:text-stone-300">
                          {registeredViewers.map((v, i) => {
                            const u = v.user || {};
                            const dev = parseDeviceInfo(v.userAgent);
                            return (
                              <tr
                                key={v._id || i}
                                className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/40"
                              >
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2.5">
                                    {u.profileImage ? (
                                      <img
                                        src={u.profileImage}
                                        alt={u.name || 'User'}
                                        className="w-7 h-7 rounded-xl object-cover shrink-0"
                                      />
                                    ) : (
                                      <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                                        {u.name?.charAt(0) || 'U'}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <span className="font-semibold block truncate">
                                        {u.name || 'Registered Client'}
                                      </span>
                                      <span className="text-[10px] text-stone-400 block truncate">
                                        {u.phone || u.email || ''}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 max-w-[160px] truncate"
                                    title={v.userAgent}
                                  >
                                    {dev.isMobile ? (
                                      <Smartphone className="w-3 h-3 text-amber-600 shrink-0" />
                                    ) : (
                                      <Monitor className="w-3 h-3 text-blue-500 shrink-0" />
                                    )}
                                    <span className="truncate">{dev.label}</span>
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg">
                                    <Clock className="w-3 h-3" />
                                    {v.watchDuration ? `${v.watchDuration}s` : 'Viewed'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-stone-400 font-mono">
                                  <div className="flex items-center gap-1">
                                    <span>{v.ip || 'N/A'}</span>
                                    {v.ip && (
                                      <button
                                        onClick={() => handleCopyIp(v.ip)}
                                        className="p-0.5 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                                        title="Copy IP"
                                      >
                                        {copiedIp === v.ip ? (
                                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-2.5 h-2.5" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-stone-400 whitespace-nowrap">
                                  {v.viewedAt ? new Date(v.viewedAt).toLocaleString() : 'N/A'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  anonymousViewers.length === 0 ? (
                    <p className="text-xs text-stone-400 py-8 text-center">
                      No anonymous viewer logs recorded yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 dark:bg-zinc-800/80 text-[10px] uppercase font-bold text-stone-500 sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3 rounded-l-xl">IP Address</th>
                            <th className="py-2.5 px-3">Device / Browser</th>
                            <th className="py-2.5 px-3">Watch Duration</th>
                            <th className="py-2.5 px-3 rounded-r-xl">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 text-stone-700 dark:text-stone-300">
                          {anonymousViewers.map((v, i) => {
                            const dev = parseDeviceInfo(v.userAgent);
                            return (
                              <tr
                                key={i}
                                className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/40"
                              >
                                <td className="py-2.5 px-3 text-[11px] font-mono text-stone-700 dark:text-stone-300">
                                  <div className="flex items-center gap-1">
                                    <span>{v.ip || 'Anonymous'}</span>
                                    {v.ip && (
                                      <button
                                        onClick={() => handleCopyIp(v.ip)}
                                        className="p-0.5 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                                        title="Copy IP"
                                      >
                                        {copiedIp === v.ip ? (
                                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-2.5 h-2.5" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 max-w-xs truncate"
                                    title={v.userAgent}
                                  >
                                    {dev.isMobile ? (
                                      <Smartphone className="w-3 h-3 text-amber-600 shrink-0" />
                                    ) : (
                                      <Monitor className="w-3 h-3 text-blue-500 shrink-0" />
                                    )}
                                    <span className="truncate">{dev.label}</span>
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg">
                                    <Clock className="w-3 h-3" />
                                    {v.watchDuration ? `${v.watchDuration}s` : 'Viewed'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-stone-400 whitespace-nowrap">
                                  {v.viewedAt ? new Date(v.viewedAt).toLocaleString() : 'N/A'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            )}

            {/* TAB CONTENT 3: Liked By Users (`likedByUsers`) */}
            {activeTab === 'likes' && (
              <div className="space-y-3">
                {likedByUsers.length === 0 ? (
                  <p className="text-xs text-stone-400 py-8 text-center">
                    No likes recorded yet on this reel.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {likedByUsers.map((item, idx) => {
                      const u = item.user || {};
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {u.profileImage ? (
                              <img
                                src={u.profileImage}
                                alt={u.name || 'User'}
                                className="w-9 h-9 rounded-2xl object-cover shrink-0 ring-1 ring-stone-200 dark:ring-zinc-700"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 font-bold flex items-center justify-center shrink-0">
                                {u.name?.charAt(0) || 'U'}
                              </div>
                            )}

                            <div className="min-w-0">
                              <span className="font-bold text-stone-800 dark:text-stone-200 block truncate">
                                {u.name || 'Client User'}
                              </span>
                              <span className="text-[10px] text-stone-400 block truncate">
                                {u.phone || u.email || ''}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <Heart className="w-4 h-4 text-rose-500 fill-current ml-auto" />
                            <span className="text-[10px] text-stone-400 block mt-0.5">
                              {item.likedAt ? new Date(item.likedAt).toLocaleDateString() : 'Liked'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: Shares & Bookings */}
            {activeTab === 'shares' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Social Shares Log ({sharesList.length})
                  </span>
                  {sharesList.length === 0 ? (
                    <p className="text-xs text-stone-400 py-6 text-center">
                      No social shares recorded yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto">
                      {sharesList.map((share, idx) => (
                        <div
                          key={share._id || idx}
                          className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-bold text-stone-800 dark:text-stone-200 capitalize">
                              {share.platform || 'WhatsApp / Social'}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400">
                            {share.sharedAt ? new Date(share.sharedAt).toLocaleString() : 'Shared'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bookings */}
                <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Direct Client Booking Inquiries ({bookingsList.length})
                  </span>
                  {bookingsList.length === 0 ? (
                    <p className="text-xs text-stone-400 py-4 text-center">
                      No direct booking requests initiated from this reel yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {bookingsList.map((b, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            Booking #{i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {activeImagePreview && (
        <Modal
          isOpen={!!activeImagePreview}
          onClose={() => setActiveImagePreview(null)}
          title="Artwork Photo Preview"
          maxWidth="max-w-2xl"
        >
          <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            <img
              src={activeImagePreview}
              alt="Design Preview"
              className="w-full max-h-[70vh] object-contain"
            />
          </div>
        </Modal>
      )}

      {/* Edit Reel Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Reel Details"
          subtitle="Update reel title, description, tags, and linked booking design"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Reel Title *
              </label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm font-medium text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Caption / Description
              </label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 space-y-3">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                Linked Booking Design Pricing
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">
                    Standard Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-sm font-bold text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">
                    Discounted Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.discountedPrice}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        discountedPrice: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutationLoading}
                className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md shadow-amber-800/20 disabled:opacity-50 cursor-pointer"
              >
                {mutationLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Reel Dialog */}
      <ConfirmDialog
        isOpen={isDeleteReelOpen}
        onClose={() => setIsDeleteReelOpen(false)}
        onConfirm={handleConfirmDeleteReel}
        title="Delete Video Reel"
        description={`Are you sure you want to permanently delete "${reel.title}"? This cannot be undone.`}
        confirmText="Yes, Delete Reel"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={mutationLoading}
        icon={Trash2}
      />

      {/* Delete Comment Dialog */}
      <ConfirmDialog
        isOpen={!!deletingComment}
        onClose={() => setDeletingComment(null)}
        onConfirm={handleConfirmDeleteComment}
        title="Delete User Comment"
        description={`Are you sure you want to delete this comment: "${deletingComment?.commentText}"?`}
        confirmText="Yes, Delete Comment"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={mutationLoading}
        icon={Trash2}
      />
    </div>
  );
};

export default ReelDetail;
