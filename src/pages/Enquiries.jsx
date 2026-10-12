import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  MailQuestion,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Clock,
  Eye,
  Trash2,
  CheckCircle,
  MessageSquare,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import {
  addEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
  setStatusFilter,
  setSearchQuery
} from '../redux/slices/enquiriesSlice';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate } from '../utils/formatters';
import { toast } from 'sonner';

export const Enquiries = () => {
  const dispatch = useDispatch();
  const { items: enquiries, statusFilter, searchQuery } = useSelector((state) => state.enquiries);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    email: '',
    eventType: 'Bridal Wedding',
    packageInterest: 'The Royal Maharani Bridal',
    eventDate: '',
    venue: '',
    budget: '₹45,000',
    guestCount: '10-15 Guests',
    message: '',
    status: 'New',
    internalNotes: ''
  });

  const statuses = ['All', 'New', 'In Review', 'Confirmed', 'Completed', 'Cancelled'];

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesSearch =
      e.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.phone.includes(searchQuery) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.packageInterest.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenAdd = () => {
    setFormData({
      clientName: '',
      phone: '',
      email: '',
      eventType: 'Bridal Wedding',
      packageInterest: 'The Royal Maharani Bridal',
      eventDate: '',
      venue: '',
      budget: '₹45,000',
      guestCount: '10-15 Guests',
      message: '',
      status: 'New',
      internalNotes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.phone) {
      toast.error('Bride/Client name and contact number are required');
      return;
    }
    await dispatch(addEnquiry(formData));
    toast.success('New booking enquiry recorded');
    setIsAddModalOpen(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    await dispatch(updateEnquiryStatus({ id, status: newStatus }));
    toast.success(`Booking status changed to "${newStatus}"`);
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleSaveNotes = async (id, notes) => {
    await dispatch(updateEnquiryStatus({ id, status: selectedEnquiry.status, internalNotes: notes }));
    toast.success('Internal artist notes updated');
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete enquiry from ${name}?`)) {
      await dispatch(deleteEnquiry(id));
      toast.success('Enquiry removed');
      setIsDetailModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white">
              Contact & Booking Enquiries
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {enquiries.length} Inquiries
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Track incoming bride consultation requests, event dates, venues, and WhatsApp follow-ups.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-800/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Record Enquiry
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search by bride name, contact, venue, package..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200/70 dark:border-zinc-700 focus:outline-none focus:border-amber-500 text-stone-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => dispatch(setStatusFilter(st))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 hover:bg-amber-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 dark:bg-zinc-800/60 text-stone-500 dark:text-stone-400 uppercase text-[11px] font-bold tracking-wider border-b border-stone-200/80 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Bride / Client</th>
                <th className="py-3.5 px-4">Event & Venue</th>
                <th className="py-3.5 px-4">Package & Budget</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Contact / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">
                    No booking inquiries found matching filters.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-amber-50/30 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div>
                        <span className="font-bold text-stone-900 dark:text-white block">
                          {enq.clientName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                          <span>{enq.phone}</span>
                          {enq.email && <span>• {enq.email}</span>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="inline-flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          {formatDate(enq.eventDate)} ({enq.eventType})
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-700" />
                          <span className="truncate max-w-[180px]">{enq.venue}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 text-xs truncate max-w-[160px] block">
                          {enq.packageInterest}
                        </span>
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 font-royal">
                          Budget: {enq.budget}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="New">New</option>
                        <option value="In Review">In Review</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(enq.clientName)},%20thank%20you%20for%20contacting%20Noor%20Mehndi%20Arts%20for%20your%20${encodeURIComponent(enq.eventType)}%20on%20${encodeURIComponent(enq.eventDate)}!`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> WhatsApp
                        </a>

                        <button
                          onClick={() => {
                            setSelectedEnquiry(enq);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-amber-700 hover:bg-amber-100/50 dark:hover:bg-zinc-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Enquiry Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Booking Enquiry"
        subtitle="Capture bridal inquiry details from phone call or direct message"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Bride / Client Name *
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Deepika Mehra"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                WhatsApp Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="bride@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Event Type
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Bridal Wedding">Bridal Wedding</option>
                <option value="Sangeet Party">Sangeet Party</option>
                <option value="Engagement & Roka">Engagement & Roka</option>
                <option value="Festive Mehndi">Festive / Karwa Chauth</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Event Date
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Venue Location
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. ITC Grand Bharat, Gurgaon"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Package Requested
              </label>
              <input
                type="text"
                value={formData.packageInterest}
                onChange={(e) => setFormData({ ...formData, packageInterest: e.target.value })}
                placeholder="e.g. The Royal Maharani Bridal"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Budget (₹)
              </label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="₹45,000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Client Message / Specific Request
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Design preferences, special motifs, figure requirements..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md shadow-amber-800/20"
            >
              Save Enquiry
            </button>
          </div>
        </form>
      </Modal>

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Enquiry: ${selectedEnquiry.clientName}`}
          subtitle={`Lead ID: ${selectedEnquiry.id} • ${formatDate(selectedEnquiry.createdAt)}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/50 dark:bg-zinc-800/50 border border-amber-200/50">
              <div>
                <h3 className="text-base font-bold font-royal text-stone-900 dark:text-white">
                  {selectedEnquiry.packageInterest}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Budget: <strong className="text-amber-800 dark:text-amber-400 font-royal">{selectedEnquiry.budget}</strong> • {selectedEnquiry.guestCount}
                </p>
              </div>
              <StatusBadge status={selectedEnquiry.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200/60">
                <span className="text-stone-400 block text-[11px] uppercase font-bold">Contact Phone</span>
                <span className="font-semibold text-stone-800 dark:text-white mt-1 block">
                  {selectedEnquiry.phone}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200/60">
                <span className="text-stone-400 block text-[11px] uppercase font-bold">Email</span>
                <span className="font-semibold text-stone-800 dark:text-white mt-1 block">
                  {selectedEnquiry.email || 'N/A'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200/60">
                <span className="text-stone-400 block text-[11px] uppercase font-bold">Event Date</span>
                <span className="font-semibold text-stone-800 dark:text-white mt-1 block">
                  {formatDate(selectedEnquiry.eventDate)} ({selectedEnquiry.eventType})
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200/60">
                <span className="text-stone-400 block text-[11px] uppercase font-bold">Venue</span>
                <span className="font-semibold text-stone-800 dark:text-white mt-1 block">
                  {selectedEnquiry.venue}
                </span>
              </div>
            </div>

            {selectedEnquiry.message && (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200/60">
                <span className="text-stone-400 block text-[11px] uppercase font-bold mb-1">Client Note:</span>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  &ldquo;{selectedEnquiry.message}&rdquo;
                </p>
              </div>
            )}

            {/* Internal Notes Editor */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Internal Studio Follow-up Notes
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue={selectedEnquiry.internalNotes || ''}
                  id="internalNotesInput"
                  placeholder="Add private note (e.g. Spoke on call, advance pending...)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('internalNotesInput');
                    handleSaveNotes(selectedEnquiry.id, input.value);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Direct WhatsApp button in modal */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-zinc-800">
              <button
                onClick={() => handleDelete(selectedEnquiry.id, selectedEnquiry.clientName)}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Enquiry
              </button>

              <a
                href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedEnquiry.clientName)},%20this%20is%20Noor%20from%20Noor%20Mehndi%20Arts!`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-700/20"
              >
                <Phone className="w-4 h-4" /> Message on WhatsApp
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Enquiries;
