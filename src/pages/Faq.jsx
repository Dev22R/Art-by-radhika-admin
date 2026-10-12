import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  HelpCircle,
  Plus,
  Search,
  ChevronDown,
  Edit,
  Trash2,
  Sparkles,
  CheckCircle,
  Filter
} from 'lucide-react';
import {
  addFaq,
  updateFaq,
  deleteFaq,
  setCategoryFilter,
  setSearchQuery
} from '../redux/slices/faqSlice';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import { toast } from 'sonner';

export const Faq = () => {
  const dispatch = useDispatch();
  const { items: faqs, categoryFilter, searchQuery } = useSelector((state) => state.faqs);

  const [expandedId, setExpandedId] = useState(faqs[0]?.id || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const categories = [
    'All',
    'Booking & Advance',
    'Henna & Skin Care',
    'Stain Tips & Aftercare',
    'Travel & Destination',
    'Bridal Trial'
  ];

  // Form State
  const [formData, setFormData] = useState({
    category: 'Booking & Advance',
    question: '',
    answer: '',
    status: 'Published'
  });

  const filteredFaqs = faqs.filter((f) => {
    const matchesCategory = categoryFilter === 'All' || f.category === categoryFilter;
    const matchesSearch =
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setFormData({
      category: 'Booking & Advance',
      question: '',
      answer: '',
      status: 'Published'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (faq) => {
    setFormData({
      id: faq.id,
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      status: faq.status
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      toast.error('Question and answer are required');
      return;
    }
    await dispatch(addFaq(formData));
    toast.success('FAQ question added');
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    await dispatch(updateFaq(formData));
    toast.success('FAQ updated');
    setIsEditModalOpen(false);
  };

  const handleDelete = async (id, question) => {
    if (window.confirm(`Delete FAQ: "${question}"?`)) {
      await dispatch(deleteFaq(id));
      toast.success('FAQ deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white">
              FAQ & Knowledge Base
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {faqs.length} Answers
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage bridal henna guidance, after-care instructions, and studio booking policies.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-800/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Question
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => dispatch(setCategoryFilter(cat))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-amber-700 text-white shadow-md shadow-amber-800/20'
                  : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-zinc-800 hover:bg-amber-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search FAQs and tips..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 focus:outline-none focus:border-amber-500 text-stone-900 dark:text-white"
          />
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center text-stone-400 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800">
            No FAQs found matching your criteria.
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-200"
              >
                {/* Accordion Question Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-amber-50/40 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-zinc-800 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs font-royal">
                      Q
                    </div>
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-zinc-800 text-amber-800 dark:text-amber-300 mb-1">
                        {faq.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={faq.status} />
                    <ChevronDown
                      className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-amber-600' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Accordion Answer Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-stone-100 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-900/50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs font-royal">
                        A
                      </div>
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed flex-1">
                        {faq.answer}
                      </p>
                    </div>

                    {/* Actions on bottom of accordion */}
                    <div className="mt-4 pt-3 border-t border-stone-200/50 dark:border-zinc-800 flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(faq);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800 flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Question
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(faq.id, faq.question);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit FAQ Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add FAQ Knowledge Item' : 'Edit Question & Answer'}
        subtitle="Provide clear answers to help brides understand henna stain care, packages, and bookings"
      >
        <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Question *
            </label>
            <input
              type="text"
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. How do I achieve the darkest mahogany stain on wedding day?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Detailed Answer *
            </label>
            <textarea
              rows={4}
              required
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Explain the step-by-step guidance..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
            />
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
              {isAddModalOpen ? 'Save Question' : 'Update FAQ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Faq;
