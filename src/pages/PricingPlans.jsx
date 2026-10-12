import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  BadgePercent,
  Plus,
  Check,
  Edit,
  Trash2,
  FileDown,
  Sparkles,
  ShieldCheck,
  Clock,
  HeartHandshake
} from 'lucide-react';
import {
  addPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  togglePlanPopular
} from '../redux/slices/pricingSlice';
import Modal from '../components/common/Modal';
import { formatCurrency } from '../utils/formatters';
import { generatePricingPdf } from '../utils/pdfGenerator';
import { toast } from 'sonner';

export const PricingPlans = () => {
  const dispatch = useDispatch();
  const { items: plans } = useSelector((state) => state.pricing);
  const studioProfile = useSelector((state) => state.auth.user) || {};

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    price: 35000,
    duration: '4 - 5 Hours',
    isPopular: false,
    status: 'Active',
    featuresText: '',
    depositPercent: 30,
    bookingWindow: 'Book 2-3 Months in Advance'
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      tagline: '',
      price: 35000,
      duration: '4 - 5 Hours',
      isPopular: false,
      status: 'Active',
      featuresText: 'Full Bridal Arms & Feet\nOrganic Henna Cones\nTrial Session Included\nAftercare Clove Balm',
      depositPercent: 30,
      bookingWindow: 'Book 2-4 Months in Advance'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setFormData({
      id: plan.id,
      name: plan.name,
      tagline: plan.tagline || '',
      price: plan.price,
      duration: plan.duration,
      isPopular: plan.isPopular,
      status: plan.status,
      featuresText: (plan.features || []).join('\n'),
      depositPercent: plan.depositPercent || 30,
      bookingWindow: plan.bookingWindow || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Package name and pricing amount are required');
      return;
    }
    await dispatch(
      addPricingPlan({
        ...formData,
        features: formData.featuresText.split('\n').map((f) => f.trim()).filter(Boolean)
      })
    );
    toast.success('New wedding pricing plan created');
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    await dispatch(
      updatePricingPlan({
        ...formData,
        features: formData.featuresText.split('\n').map((f) => f.trim()).filter(Boolean)
      })
    );
    toast.success('Package details updated');
    setIsEditModalOpen(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete package "${name}"?`)) {
      await dispatch(deletePricingPlan(id));
      toast.success('Package deleted');
    }
  };

  const handleTogglePopular = async (id) => {
    await dispatch(togglePlanPopular(id));
    toast.info('Popular badge updated');
  };

  const handleExportPdf = async (plan) => {
    try {
      setIsExporting(true);
      toast.loading('Generating official PDF quote...', { id: 'pdf-toast' });
      await generatePricingPdf(plan, {
        phone: '+91 98765 00000',
        email: 'admin@noormehndiarts.com',
        address: 'Jaipur & Delhi NCR'
      });
      toast.success('PDF quotation downloaded!', { id: 'pdf-toast' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF quotation', { id: 'pdf-toast' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white">
              Pricing Packages & Plans
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {plans.length} Packages
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Configure bridal packages, sangeet guest rates, and export customized PDF proposals for brides.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-800/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Package
        </button>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between border ${
              plan.isPopular
                ? 'bg-gradient-to-b from-amber-900/10 via-white to-white dark:from-amber-950/40 dark:via-zinc-900 dark:to-zinc-900 border-amber-500/50 shadow-xl ring-2 ring-amber-500/20'
                : 'bg-white dark:bg-zinc-900 border-stone-200/80 dark:border-zinc-800 shadow-sm hover:shadow-lg'
            }`}
          >
            {/* Popular Badge */}
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Most Popular Bride Choice
              </div>
            )}

            <div>
              {/* Package Header */}
              <div className="flex items-start justify-between gap-2 pt-2">
                <div>
                  <h3 className="text-lg font-bold font-royal text-stone-900 dark:text-white leading-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 min-h-[32px]">
                    {plan.tagline}
                  </p>
                </div>
              </div>

              {/* Price & Deposit */}
              <div className="my-5 pb-5 border-b border-stone-100 dark:border-zinc-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-royal text-stone-900 dark:text-white">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-xs text-stone-400">/ package</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{plan.depositPercent || 30}% Advance Deposit Required</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-400">
                  <Clock className="w-3 h-3" />
                  <span>{plan.duration}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Package Inclusions:
                </p>
                <ul className="space-y-2">
                  {(plan.features || []).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <div className="p-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mt-0.5 shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-8 pt-4 border-t border-stone-100 dark:border-zinc-800 space-y-2">
              <button
                onClick={() => handleExportPdf(plan)}
                disabled={isExporting}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-amber-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-amber-200/60 dark:border-zinc-700"
              >
                <FileDown className="w-4 h-4" /> Download Official PDF Quote
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleTogglePopular(plan.id)}
                  className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  {plan.isPopular ? 'Remove Featured' : 'Mark Most Popular'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 dark:hover:text-white"
                    title="Edit Package"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id, plan.name)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600"
                    title="Delete Package"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Package Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Create Bridal Pricing Package' : 'Edit Package Details'}
        subtitle="Specify inclusions, bridal timeline, price, and deposit requirements"
      >
        <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Package Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Royal Rajputana Bridal"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Short Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Complete heirloom coverage for the bride"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Package Investment (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Coverage Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 5 Hours / Full Day"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Advance Deposit (%)
              </label>
              <input
                type="number"
                value={formData.depositPercent}
                onChange={(e) => setFormData({ ...formData, depositPercent: Number(e.target.value) })}
                placeholder="30"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Booking Lead Window
              </label>
              <input
                type="text"
                value={formData.bookingWindow}
                onChange={(e) => setFormData({ ...formData, bookingWindow: e.target.value })}
                placeholder="e.g. Book 3-6 Months in Advance"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Package Features (One per line)
            </label>
            <textarea
              rows={5}
              value={formData.featuresText}
              onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
              placeholder="Full Hand Coverage\nOrganic Cones\nTrial Session"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Tag this as &quot;Most Popular Choice&quot;</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md shadow-amber-800/20"
            >
              {isAddModalOpen ? 'Create Package' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PricingPlans;
