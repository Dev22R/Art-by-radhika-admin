import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import {
  Film,
  Plus,
  Play,
  Eye,
  EyeOff,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Edit,
  Sparkles,
  ExternalLink,
  Calendar,
  IndianRupee,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Tag,
  BookmarkCheck,
  RefreshCw,
  X
} from 'lucide-react';
import {
  fetchReels,
  updateReel,
  togglePublishReel,
  deleteReel,
  deleteReelComment
} from '../redux/slices/reelsSlice';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { toast } from 'sonner';

export const Reels = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items: reels,
    summary,
    pagination,
    loading,
    mutationLoading
  } = useSelector((state) => state.reels);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Active Modals state
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [editingReel, setEditingReel] = useState(null);
  const [deletingReel, setDeletingReel] = useState(null);
  const [deletingComment, setDeletingComment] = useState(null); // { reelId, commentId, commentText }

  // Edit Form state
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

  // Fetch reels from API on mount and on page change
  useEffect(() => {
    dispatch(fetchReels({ page: currentPage, limit: 20 }));
  }, [dispatch, currentPage]);

  // Keep activeVideoModal in sync when reel comments change
  useEffect(() => {
    if (activeVideoModal) {
      const updated = reels.find(
        (r) => (r._id || r.id) === (activeVideoModal._id || activeVideoModal.id)
      );
      if (updated) {
        setActiveVideoModal(updated);
      }
    }
  }, [reels]);

  // Open Edit Modal
  const handleOpenEdit = (reel) => {
    setEditingReel(reel);
    setEditForm({
      title: reel.title || '',
      description: reel.description || '',
      tags: Array.isArray(reel.tags) ? reel.tags.join(', ') : reel.tags || '',
      designName: reel.adminDesign?.designName || reel.title || '',
      category: reel.adminDesign?.category || 'bridal',
      price: reel.adminDesign?.price ?? 15000,
      discountedPrice: reel.adminDesign?.discountedPrice ?? 12999,
      estimatedTime: reel.adminDesign?.estimatedTime || '4-5 hours',
      isBookable: reel.adminDesign?.isBookable !== undefined ? Boolean(reel.adminDesign?.isBookable) : true
    });
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingReel) return;

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
          reelId: editingReel._id || editingReel.id,
          data: payload
        })
      ).unwrap();
      toast.success('Reel details updated successfully!');
      setEditingReel(null);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update reel');
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async (reel) => {
    const reelId = reel._id || reel.id;
    try {
      const res = await dispatch(togglePublishReel(reelId)).unwrap();
      const statusText = res.isPublished ? 'published' : 'draft';
      toast.success(`Reel marked as ${statusText}`);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to toggle status');
    }
  };

  // Confirm Delete Reel
  const handleConfirmDeleteReel = async () => {
    if (!deletingReel) return;
    const reelId = deletingReel._id || deletingReel.id;
    try {
      await dispatch(deleteReel(reelId)).unwrap();
      toast.success(`Reel "${deletingReel.title}" deleted successfully`);
      setDeletingReel(null);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to delete reel');
    }
  };

  // Confirm Delete Comment
  const handleConfirmDeleteComment = async () => {
    if (!deletingComment) return;
    const { reelId, commentId } = deletingComment;
    try {
      await dispatch(deleteReelComment({ reelId, commentId })).unwrap();
      toast.success('Comment deleted from reel');
      setDeletingComment(null);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to delete comment');
    }
  };

  // Filter reels based on search term, status, and category
  const filteredReels = reels.filter((reel) => {
    // Search
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = reel.title?.toLowerCase().includes(searchLower);
    const descMatch = reel.description?.toLowerCase().includes(searchLower);
    const tagMatch = Array.isArray(reel.tags)
      ? reel.tags.some((t) => t.toLowerCase().includes(searchLower))
      : reel.tags?.toLowerCase().includes(searchLower);
    const matchesSearch = !searchTerm || titleMatch || descMatch || tagMatch;

    // Status filter
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'published' && (reel.isPublished || reel.status === 'published')) ||
      (selectedStatus === 'draft' && (!reel.isPublished || reel.status === 'draft'));

    // Category filter
    const matchesCategory =
      selectedCategory === 'all' ||
      reel.adminDesign?.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white">
              Reels Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {summary?.totalReels ?? reels.length} Videos
            </span>
          </div>

        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => dispatch(fetchReels({ page: currentPage, limit: 20 }))}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 transition-colors shadow-sm cursor-pointer"
            title="Refresh Reels"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/reels/create')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-800/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create / Upload Reel
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Reels */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Reels</span>
            <Film className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {summary?.totalReels ?? reels.length}
          </p>
        </div>

        {/* Total Views */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Views</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {summary?.totalViews ?? 0}
          </p>
        </div>

        {/* Total Likes */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Likes</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {summary?.totalLikes ?? 0}
          </p>
        </div>

        {/* Total Comments */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Comments</span>
            <MessageCircle className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {summary?.totalComments ?? 0}
          </p>
        </div>

        {/* Total Shares */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Shares</span>
            <Share2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {summary?.totalShares ?? 0}
          </p>
        </div>

        {/* Total Bookings */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bookings</span>
            <BookmarkCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {summary?.totalBookings ?? 0}
          </p>
        </div>
      </div>

      {/* 3. Search and Filters Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reels by title, description or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:border-amber-500 shrink-0"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:border-amber-500 shrink-0"
          >
            <option value="all">All Categories</option>
            <option value="bridal">Bridal</option>
            <option value="arabic">Arabic</option>
            <option value="rajasthani">Rajasthani</option>
            <option value="indo-arabic">Indo-Arabic</option>
            <option value="mandala">Mandala</option>
            <option value="minimalist">Minimalist</option>
            <option value="portrait">Portrait</option>
          </select>
        </div>
      </div>

      {/* 4. Loading State */}
      {loading && reels.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm font-medium">
            Loading video reels from server...
          </p>
        </div>
      ) : filteredReels.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-white">
            No video reels found
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all'
              ? 'Try adjusting your search criteria or filter tags.'
              : 'Upload your first henna reel to start showcasing on the mobile client feed.'}
          </p>
          <button
            onClick={() => navigate('/reels/create')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            Upload New Reel
          </button>
        </div>
      ) : (
        /* 5. Reels Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReels.map((reel) => {
            const reelId = reel._id || reel.id;
            const thumbnailUrl =
              reel.thumbnail?.url || reel.thumbnail || '/placeholder-thumb.jpg';
            const videoUrl = reel.video?.url || reel.videoUrl;
            const isPub = reel.isPublished || reel.status === 'published';
            const viewsCount = reel.viewCount ?? reel.views?.length ?? 0;
            const likesCount = reel.likeCount ?? reel.likes?.length ?? 0;
            const commentsCount = reel.commentCount ?? reel.comments?.length ?? 0;
            const sharesCount = reel.shareCount ?? reel.shares?.length ?? 0;
            const bookingsCount = reel.bookingCount ?? 0;

            const categoryName =
              reel.adminDesign?.category || reel.category || 'Showcase';
            const price = reel.adminDesign?.price;
            const discountedPrice = reel.adminDesign?.discountedPrice;

            return (
              <div
                key={reelId}
                className="group rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Reel Vertical 9:14 Aspect Ratio Preview */}
                  <div className="relative aspect-[9/14] w-full overflow-hidden bg-stone-950">
                    <img
                      src={thumbnailUrl}
                      alt={reel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/25 to-stone-950/40" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-xs gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 backdrop-blur-md text-amber-200 border border-amber-500/30">
                        {categoryName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${isPub
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-stone-800/90 text-stone-300 border border-stone-700'
                          }`}
                      >
                        {isPub ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    {/* Center Play Button Overlay */}
                    <button
                      onClick={() => setActiveVideoModal(reel)}
                      className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-amber-600/90 hover:bg-amber-500 text-white flex items-center justify-center shadow-xl shadow-amber-900/50 transition-transform group-hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label="Play Reel"
                    >
                      <Play className="w-6 h-6 fill-current translate-x-0.5" />
                    </button>

                    {/* Bottom Stats Overlay on Thumbnail */}
                    <div className="absolute bottom-3 left-3 right-3 text-white space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-stone-200">
                        <span className="flex items-center gap-1" title="Views">
                          <Eye className="w-3.5 h-3.5 text-blue-400" /> {viewsCount}
                        </span>
                        <span className="flex items-center gap-1" title="Likes">
                          <Heart className="w-3.5 h-3.5 text-rose-400" /> {likesCount}
                        </span>
                        <span className="flex items-center gap-1" title="Comments">
                          <MessageCircle className="w-3.5 h-3.5 text-purple-400" />{' '}
                          {commentsCount}
                        </span>
                        <span className="flex items-center gap-1" title="Shares">
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" /> {sharesCount}
                        </span>
                      </div>

                      {/* Pricing Tag if Linked Design exists */}
                      {(discountedPrice || price) && (
                        <div className="pt-1 border-t border-white/10 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-0.5">
                            <IndianRupee className="w-3 h-3" />
                            {discountedPrice || price}
                            {discountedPrice && price && discountedPrice < price && (
                              <span className="text-stone-400 line-through text-[10px] ml-1">
                                ₹{price}
                              </span>
                            )}
                          </span>
                          {reel.adminDesign?.isBookable && (
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                              Bookable
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reel Info */}
                  <div className="p-4 space-y-2">
                    <h3
                      onClick={() => navigate(`/reels/${reelId}`)}
                      className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white line-clamp-1 leading-snug hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer transition-colors"
                    >
                      {reel.title}
                    </h3>
                    {reel.description && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                        {reel.description}
                      </p>
                    )}

                    {/* Tags preview */}
                    {Array.isArray(reel.tags) && reel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {reel.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300"
                          >
                            #{tag}
                          </span>
                        ))}
                        {reel.tags.length > 3 && (
                          <span className="text-[10px] text-stone-400 self-center">
                            +{reel.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 pb-4 pt-2 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => navigate(`/reels/${reelId}`)}
                    className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" /> Watch & Details
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Toggle Publish */}
                    <button
                      onClick={() => handleTogglePublish(reel)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isPub
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                        }`}
                      title={isPub ? 'Published (Click to Unpublish)' : 'Draft (Click to Publish)'}
                    >
                      {isPub ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit Reel */}
                    <button
                      onClick={() => handleOpenEdit(reel)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Edit Reel"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Reel */}
                    <button
                      onClick={() => setDeletingReel(reel)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete Reel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Video Player, Booking Design & Comments Modal */}
      {activeVideoModal && (
        <Modal
          isOpen={!!activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          title={activeVideoModal.title}
          subtitle={`Views: ${activeVideoModal.viewCount ?? activeVideoModal.views?.length ?? 0} • Likes: ${activeVideoModal.likeCount ?? activeVideoModal.likes?.length ?? 0
            } • Status: ${activeVideoModal.isPublished || activeVideoModal.status === 'published'
              ? 'Published'
              : 'Draft'
            }`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold text-stone-500">HD Video Stream</span>
              <button
                onClick={() => {
                  const id = activeVideoModal._id || activeVideoModal.id;
                  setActiveVideoModal(null);
                  navigate(`/reels/${id}`);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                <span>Open Full Page & Viewer Logs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Embedded Player */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-[16/9] flex items-center justify-center">
              <ReactPlayer
                url={activeVideoModal.video?.url || activeVideoModal.videoUrl}
                controls
                playing
                width="100%"
                height="100%"
              />
            </div>

            {/* Description & Tags */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-zinc-800/50 border border-amber-200/50 dark:border-zinc-700/50 space-y-2">
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                {activeVideoModal.description || 'No description provided.'}
              </p>
              {Array.isArray(activeVideoModal.tags) && activeVideoModal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeVideoModal.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-200/60 dark:bg-zinc-700 text-amber-900 dark:text-amber-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Linked Design Details */}
            {activeVideoModal.adminDesign && (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                      Linked Booking Design ({activeVideoModal.adminDesign.designName || 'Showcase'})
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{activeVideoModal.adminDesign.discountedPrice || activeVideoModal.adminDesign.price}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase">Category</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">
                      {activeVideoModal.adminDesign.category || 'Bridal'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase">Est. Time</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {activeVideoModal.adminDesign.estimatedTime || '3-4 hours'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase">Bookable</span>
                    <span className="font-semibold text-emerald-600">
                      {activeVideoModal.adminDesign.isBookable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase">Design Code</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {activeVideoModal.adminDesign.designCode || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Design Images Preview */}
                {Array.isArray(activeVideoModal.adminDesign.images) &&
                  activeVideoModal.adminDesign.images.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] text-stone-400 block uppercase mb-1.5">
                        Design Photos Gallery
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {activeVideoModal.adminDesign.images.map((imgUrl, i) => (
                          <img
                            key={i}
                            src={imgUrl}
                            alt={`Gallery ${i + 1}`}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 ring-1 ring-stone-200 dark:ring-zinc-700"
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Comments List & Delete Comment Capability */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                    User Comments ({activeVideoModal.comments?.length || 0})
                  </h4>
                </div>
              </div>

              {!activeVideoModal.comments || activeVideoModal.comments.length === 0 ? (
                <p className="text-xs text-stone-400 py-3 text-center">
                  No comments yet on this reel.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {activeVideoModal.comments.map((comm) => (
                    <div
                      key={comm._id}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/70 border border-stone-100 dark:border-zinc-700/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            {comm.userName || 'User'}
                          </span>
                          {comm.createdAt && (
                            <span className="text-[10px] text-stone-400">
                              {new Date(comm.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-600 dark:text-stone-300 break-words">
                          {comm.text}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setDeletingComment({
                            reelId: activeVideoModal._id || activeVideoModal.id,
                            commentId: comm._id,
                            commentText: comm.text
                          })
                        }
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                        title="Delete Comment (Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Edit Reel Details Modal */}
      {editingReel && (
        <Modal
          isOpen={!!editingReel}
          onClose={() => setEditingReel(null)}
          title="Edit Reel Details"
          subtitle="Update reel title, caption, tags, and linked booking pricing"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Reel Title *
              </label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Description / Caption
              </label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            {/* Tags */}
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

            {/* Pricing Details */}
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

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingReel(null)}
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

      {/* 8. Confirm Delete Reel Dialog */}
      <ConfirmDialog
        isOpen={!!deletingReel}
        onClose={() => setDeletingReel(null)}
        onConfirm={handleConfirmDeleteReel}
        title="Delete Video Reel"
        description={`Are you sure you want to delete "${deletingReel?.title}"? This will permanently delete the reel video, thumbnail, and engagement analytics.`}
        confirmText="Yes, Delete Reel"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={mutationLoading}
        icon={Trash2}
      />

      {/* 9. Confirm Delete Comment Dialog */}
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

export default Reels;
