import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Palette,
  Plus,
  Search,
  Star,
  Clock,
  Tag,
  Eye,
  Trash2,
  Edit,
  Sparkles,
  Layers,
  Heart,
  CalendarCheck,
  Film,
  Lock,
  Unlock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import {
  fetchDesigns,
  togglePublishDesign,
  toggleReelFeed,
  deleteDesign,
  setDesignSearchQuery,
  setCategoryFilter,
  setComplexityFilter,
  setCurrentPage
} from '../redux/slices/designsSlice';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'sonner';

const CATEGORIES = [
  { label: 'All Categories', value: 'all' },
  { label: 'Bridal', value: 'bridal' },
  { label: 'Arabic', value: 'arabic' },
  { label: 'Rajasthani', value: 'rajasthani' },
  { label: 'Indo-Arabic', value: 'indo-arabic' },
  { label: 'Mandala', value: 'mandala' },
  { label: 'Khafif', value: 'khafif' }
];

const COMPLEXITIES = [
  { label: 'All Complexities', value: 'all' },
  { label: 'Masterpiece', value: 'masterpiece' },
  { label: 'Intricate', value: 'intricate' },
  { label: 'Medium', value: 'medium' },
  { label: 'Simple', value: 'simple' }
];

export const Designs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items: designs,
    summary,
    pagination,
    loading,
    error,
    searchQuery,
    categoryFilter,
    complexityFilter,
    currentPage
  } = useSelector((state) => state.designs);

  const [searchInput, setSearchInput] = useState(searchQuery);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    design: null,
    isLoading: false
  });

  // Fetch designs on filters change
  useEffect(() => {
    dispatch(
      fetchDesigns({
        page: currentPage,
        limit: 12,
        search: searchQuery,
        category: categoryFilter,
        complexity: complexityFilter
      })
    );
  }, [dispatch, currentPage, searchQuery, categoryFilter, complexityFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        dispatch(setDesignSearchQuery(searchInput));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, dispatch]);

  const handleRefresh = () => {
    dispatch(
      fetchDesigns({
        page: currentPage,
        limit: 12,
        search: searchQuery,
        category: categoryFilter,
        complexity: complexityFilter
      })
    );
    toast.info('Refreshing portfolio designs...');
  };

  const handleTogglePublish = async (design, e) => {
    e.stopPropagation();
    try {
      await dispatch(togglePublishDesign(design._id)).unwrap();
      toast.success(
        `"${design.title}" is now ${!design.isPublished ? 'Live Published' : 'Draft Only'}`
      );
    } catch (err) {
      toast.error(err || 'Failed to update publish status');
    }
  };

  const handleToggleReelFeed = async (design, e) => {
    e.stopPropagation();
    try {
      await dispatch(toggleReelFeed(design._id)).unwrap();
      toast.success(
        `Reel feed display ${!design.showInReelFeed ? 'Enabled' : 'Disabled'} for "${design.title}"`
      );
    } catch (err) {
      toast.error(err || 'Failed to update reel feed visibility');
    }
  };

  const handleOpenDeleteModal = (design, e) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      design,
      isLoading: false
    });
  };

  const handleCloseConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      design: null,
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    const { design } = confirmModal;
    if (!design) return;

    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await dispatch(deleteDesign(design._id)).unwrap();
      toast.success(`Design "${design.title}" deleted.`);
      handleCloseConfirmModal();
    } catch (err) {
      toast.error(err || 'Failed to delete design');
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const totalPages = pagination?.pages || 1;
  const totalItems = summary?.totalDesigns ?? pagination?.total ?? designs.length;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white">
              Mehndi Portfolio & Catalog
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/40">
              {totalItems} Artworks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage bridal, Arabic, Rajasthani mehndi masterpieces, prices, and video reel feeds.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 shadow-sm transition-all"
            title="Refresh Portfolio"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/designs/create')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-800/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Design
          </button>
        </div>
      </div>

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Designs</p>
            <p className="text-xl font-bold font-royal text-stone-900 dark:text-white">
              {summary?.totalDesigns ?? designs.length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Views</p>
            <p className="text-xl font-bold font-royal text-blue-600 dark:text-blue-400">
              {summary?.totalViews ?? 0}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Likes</p>
            <p className="text-xl font-bold font-royal text-rose-600 dark:text-rose-400">
              {summary?.totalLikes ?? 0}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Bookings</p>
            <p className="text-xl font-bold font-royal text-emerald-600 dark:text-emerald-400">
              {summary?.totalBookings ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search designs by title, tags, or description..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200/70 dark:border-zinc-700 focus:outline-none focus:border-amber-500 text-stone-900 dark:text-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
            className="px-3 py-2 rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 text-xs font-bold border-none focus:ring-1 focus:ring-amber-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Complexity Filter */}
          <select
            value={complexityFilter}
            onChange={(e) => dispatch(setComplexityFilter(e.target.value))}
            className="px-3 py-2 rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 text-xs font-bold border-none focus:ring-1 focus:ring-amber-500"
          >
            {COMPLEXITIES.map((comp) => (
              <option key={comp.value} value={comp.value}>
                {comp.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Designs Grid */}
      {loading && designs.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm animate-pulse overflow-hidden space-y-4"
            >
              <div className="h-56 bg-stone-200 dark:bg-zinc-800" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-stone-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-stone-200 dark:bg-zinc-800 rounded w-1/2" />
                <div className="h-8 bg-stone-100 dark:bg-zinc-800/60 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : designs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center text-amber-800 dark:text-amber-300 mx-auto">
            <Palette className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold font-royal text-stone-900 dark:text-white">
            No Mehndi Artworks Found
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            {searchQuery
              ? `No designs match your search "${searchQuery}".`
              : 'Add your first royal mehndi masterpiece to the studio catalog.'}
          </p>
          <button
            onClick={() => navigate('/designs/create')}
            className="px-5 py-2.5 rounded-2xl bg-amber-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Artwork
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((d) => {
            const hasVideo = Boolean(d.video?.url);
            const cover = d.coverImage || d.images?.[0]?.url;

            return (
              <div
                key={d._id}
                onClick={() => navigate(`/designs/${d._id}`)}
                className="group rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-2xl hover:border-amber-500/50 dark:hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
              >
                {/* Media Container */}
                <div className="relative h-60 w-full overflow-hidden bg-stone-950">
                  {cover ? (
                    <img
                      src={cover}
                      alt={d.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-95"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-600">
                      <Palette className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-90" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono bg-stone-900/80 backdrop-blur-md text-white border border-white/20">
                      {d.designCode || 'BRI-000'}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase bg-amber-700/90 text-white backdrop-blur-md">
                      {d.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {hasVideo && (
                      <span className="p-1.5 rounded-xl bg-purple-600/90 text-white backdrop-blur-md" title="Has Reel Video">
                        <Film className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                        d.isPublished
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-stone-800/90 text-stone-300'
                      }`}
                    >
                      {d.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  {/* Bottom Price on Media */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <span className="text-[10px] uppercase text-amber-200 font-semibold block">
                        {d.subCategory || 'Mehndi Pattern'}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-royal">
                          {formatCurrency(d.discountedPrice || d.price)}
                        </span>
                        {d.discountedPrice && d.discountedPrice < d.price && (
                          <span className="text-xs text-stone-400 line-through">
                            {formatCurrency(d.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-900/80 backdrop-blur-md text-amber-300">
                      {d.complexity}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold font-royal text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                      {d.title}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {d.description}
                    </p>
                  </div>

                  {/* Metrics & Tags */}
                  <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-blue-500" /> {d.viewCount || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" /> {d.likeCount || 0} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" /> {d.bookingCount || 0} bookings
                      </span>
                    </div>

                    {/* Quick Toggles and Actions Footer */}
                    <div
                      className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Reel Feed Toggle */}
                      <button
                        onClick={(e) => handleToggleReelFeed(d, e)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                          d.showInReelFeed
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : 'bg-stone-100 dark:bg-zinc-800 text-stone-400'
                        }`}
                        title="Toggle Reel Feed"
                      >
                        <Film className="w-3 h-3" />
                        <span>Reels</span>
                      </button>

                      {/* Publish Switch */}
                      <button
                        onClick={(e) => handleTogglePublish(d, e)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                          d.isPublished
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                        title="Toggle Live Publish"
                      >
                        {d.isPublished ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{d.isPublished ? 'Live' : 'Draft'}</span>
                      </button>

                      <div className="flex items-center gap-1 ml-auto">
                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/designs/edit/${d._id}`)}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-zinc-800 transition-colors"
                          title="Edit Design"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={(e) => handleOpenDeleteModal(d, e)}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
                          title="Delete Design"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Showing <span className="font-bold text-stone-900 dark:text-white">{designs.length}</span> of{' '}
            <span className="font-bold text-stone-900 dark:text-white">{totalItems}</span> artworks
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => dispatch(setCurrentPage(Math.max(1, currentPage - 1)))}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl border border-stone-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors text-stone-700 dark:text-stone-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => dispatch(setCurrentPage(pg))}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  currentPage === pg
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              onClick={() => dispatch(setCurrentPage(Math.min(totalPages, currentPage + 1)))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl border border-stone-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors text-stone-700 dark:text-stone-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        isLoading={confirmModal.isLoading}
        loadingText="Deleting artwork..."
        title="Delete Mehndi Design"
        description={`Are you sure you want to delete "${confirmModal.design?.title}"? It will be removed from customer gallery and booking catalog.`}
        confirmText="Delete Design"
        confirmVariant="danger"
        icon={Trash2}
      />
    </div>
  );
};

export default Designs;
