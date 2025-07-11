import { useState } from 'react';
import { SearchIcon, FilterIcon, TrashIcon, MessageCircleIcon, CheckCircleIcon, XCircleIcon, PhoneIcon, MailIcon, CalendarIcon, EyeIcon, MessageSquareIcon, AlertCircleIcon, TagIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
import { pageAnimations } from '../../utils/animations';
interface Inquiry {
  id: number;
  subject: string;
  message: string;
  repliedMessage?: string;
  category: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Closed';
}
const InquiryManager = () => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [replyMessage, setReplyMessage] = useState('');
  // Sample data
  const inquiries: Inquiry[] = [{
    id: 1,
    subject: 'Recycling Service Inquiry',
    message: 'I would like to inquire about your recycling services for a small office. Can you provide information about pricing and frequency of collection?',
    category: 'Services',
    customerName: 'Amal Fernando',
    customerEmail: 'amal.fernando@gmail.com',
    customerPhone: '+94 77 123 4567',
    date: '2023-09-20',
    status: 'New'
  }, {
    id: 2,
    subject: 'Missed Pickup',
    message: 'Our scheduled pickup for yesterday was missed. Can someone please contact me to reschedule? Our account number is ECO-1234.',
    repliedMessage: 'Dear Lakeside Hotel, We apologize for missing your scheduled pickup. We have rescheduled it for tomorrow at the same time. Please let us know if this works for you.',
    category: 'Complaint',
    customerName: 'Lakeside Hotel',
    customerEmail: 'operations@lakesidehotel.lk',
    customerPhone: '+94 11 234 5678',
    date: '2023-09-19',
    status: 'In Progress'
  }, {
    id: 3,
    subject: 'E-waste Disposal Options',
    message: 'We have several old computers and electronic equipment that need proper disposal. Do you offer e-waste recycling services?',
    repliedMessage: 'Dear Tech Solutions, Yes, we do offer e-waste recycling services. Our team can collect your electronic waste and ensure it is properly recycled. Please let us know when would be a convenient time for pickup.',
    category: 'Services',
    customerName: 'Tech Solutions',
    customerEmail: 'admin@techsolutions.lk',
    customerPhone: '+94 76 345 6789',
    date: '2023-09-18',
    status: 'Resolved'
  }, {
    id: 4,
    subject: 'Billing Question',
    message: 'There seems to be a discrepancy in our last invoice. The amount charged does not match our service agreement. Please review and advise.',
    category: 'Billing',
    customerName: 'Green Business Ltd',
    customerEmail: 'accounts@greenbusiness.lk',
    customerPhone: '+94 71 456 7890',
    date: '2023-09-17',
    status: 'In Progress'
  }, {
    id: 5,
    subject: 'Service Area Inquiry',
    message: 'Do you provide waste collection services in the Kandy area? If so, what are your rates for residential collection?',
    category: 'General',
    customerName: 'Nimal Perera',
    customerEmail: 'nimal.perera@hotmail.com',
    customerPhone: '+94 75 567 8901',
    date: '2023-09-16',
    status: 'New'
  }, {
    id: 6,
    subject: 'Hazardous Waste Disposal',
    message: 'Our laboratory needs to dispose of chemical waste. Do you have special handling procedures for hazardous materials?',
    repliedMessage: 'Dear Medical Research Center, Yes, we have specialized procedures for handling hazardous waste. Our team is certified to handle and dispose of chemical waste according to environmental regulations. Please provide more details about the type and quantity of waste so we can prepare accordingly.',
    category: 'Services',
    customerName: 'Medical Research Center',
    customerEmail: 'lab@medresearch.lk',
    customerPhone: '+94 11 345 6789',
    date: '2023-09-15',
    status: 'Closed'
  }];
  const categories = ['General', 'Services', 'Billing', 'Complaint', 'Feedback'];
  const columns = [{
    header: 'Subject',
    accessor: 'subject',
    cell: (value: string) => <div className="font-medium text-gray-900">{value}</div>
  }, {
    header: 'Message',
    accessor: 'message',
    cell: (value: string) => <div className="text-gray-500 text-sm truncate max-w-xs">
          {value.substring(0, 60)}...
        </div>
  }, {
    header: 'Replied Message',
    accessor: 'repliedMessage',
    cell: (value: string | undefined) => value ? <div className="text-gray-500 text-sm truncate max-w-xs">
            {value.substring(0, 60)}...
          </div> : <span className="text-gray-400 text-sm italic">Not replied yet</span>
  }, {
    header: 'Category',
    accessor: 'category',
    cell: (value: string) => <div className="flex items-center">
          <TagIcon size={14} className="mr-1 text-gray-400" />
          <span>{value}</span>
        </div>
  }, {
    header: 'Status',
    accessor: 'status',
    cell: (value: string) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'New' ? 'bg-blue-100 text-blue-800' : value === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : value === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value}
        </span>
  }, {
    header: 'Actions',
    accessor: 'id',
    cell: (_: number, row: Inquiry) => <div className="flex space-x-2">
          <Button variant="outline" size="sm" icon={<EyeIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedInquiry(row);
        setIsViewModalOpen(true);
      }}>
            View
          </Button>
          <Button variant="primary" size="sm" icon={<MessageSquareIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedInquiry(row);
        setReplyMessage(row.repliedMessage || '');
        setIsReplyModalOpen(true);
      }}>
            Reply
          </Button>
          <Button variant="danger" size="sm" icon={<TrashIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedInquiry(row);
        setIsDeleteModalOpen(true);
      }}>
            Delete
          </Button>
        </div>
  }];
  const filteredInquiries = inquiries.filter(inquiry => (statusFilter === 'all' || inquiry.status === statusFilter) && (categoryFilter === 'all' || inquiry.category === categoryFilter) && (inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) || inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) || inquiry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || inquiry.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())));
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <motion.div 
          {...pageAnimations.header}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mr-4">
                <MessageCircleIcon size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
                  Customer Inquiry Management
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Manage and respond to customer inquiries and feedback
                </p>
              </div>
            </div>
            
            {/* Status Badges - Right Side */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
                <span className="text-sm font-medium">
                  New: {inquiries.filter(i => i.status === 'New').length}
                </span>
              </div>
              <div className="flex items-center space-x-1 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200">
                <span className="text-sm font-medium">
                  In Progress: {inquiries.filter(i => i.status === 'In Progress').length}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            {...pageAnimations.statsCard(0)}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Inquiries</p>
                <p className="text-3xl font-bold text-gray-900">{inquiries.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <MessageCircleIcon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            {...pageAnimations.statsCard(1)}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">New</p>
                <p className="text-3xl font-bold text-blue-600">{inquiries.filter(i => i.status === 'New').length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <AlertCircleIcon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            {...pageAnimations.statsCard(2)}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">{inquiries.filter(i => i.status === 'In Progress').length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                <MessageSquareIcon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            {...pageAnimations.statsCard(3)}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{inquiries.filter(i => i.status === 'Resolved').length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <CheckCircleIcon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters - Unified in a single row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search inquiries..." 
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              <SearchIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <select 
                value={categoryFilter} 
                onChange={e => setCategoryFilter(e.target.value)} 
                className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => 
                  <option key={category} value={category}>{category}</option>
                )}
              </select>
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            
            {/* More Filters Button */}
            <div className="flex justify-start">
              <Button variant="outline" icon={<FilterIcon size={18} />} className="px-6 py-3">
                More Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
      <Card>
        <Table columns={columns} data={filteredInquiries} onRowClick={row => {
        setSelectedInquiry(row);
        setIsViewModalOpen(true);
      }} />
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {filteredInquiries.length} of {inquiries.length} inquiries
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-green-50">
              1
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
      {/* View Inquiry Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Inquiry Details" size="lg">
        {selectedInquiry && <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">
                {selectedInquiry.subject}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedInquiry.status === 'New' ? 'bg-blue-100 text-blue-800' : selectedInquiry.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : selectedInquiry.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {selectedInquiry.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <CalendarIcon size={14} className="mr-1" />
                <span>
                  {new Date(selectedInquiry.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <TagIcon size={14} className="mr-1" />
                <span>Category: {selectedInquiry.category}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-gray-700">Message</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedInquiry.message}
                </p>
              </div>
            </div>
            {selectedInquiry.repliedMessage && <div>
                <h4 className="font-medium mb-2 text-gray-700">Reply</h4>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedInquiry.repliedMessage}
                  </p>
                </div>
              </div>}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-2 text-gray-700">
                Customer Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{selectedInquiry.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <div className="flex items-center">
                    <MailIcon size={14} className="mr-1 text-gray-400" />
                    <span>{selectedInquiry.customerEmail}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <div className="flex items-center">
                    <PhoneIcon size={14} className="mr-1 text-gray-400" />
                    <span>{selectedInquiry.customerPhone}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-2 text-gray-700">Update Status</h4>
              <div className="flex space-x-2">
                <Button size="sm" variant={selectedInquiry.status === 'In Progress' ? 'primary' : 'outline'} icon={<AlertCircleIcon size={14} />}>
                  Mark In Progress
                </Button>
                <Button size="sm" variant={selectedInquiry.status === 'Resolved' ? 'success' : 'outline'} icon={<CheckCircleIcon size={14} />}>
                  Mark Resolved
                </Button>
                <Button size="sm" variant={selectedInquiry.status === 'Closed' ? 'secondary' : 'outline'} icon={<XCircleIcon size={14} />}>
                  Mark Closed
                </Button>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" icon={<MessageCircleIcon size={18} />} onClick={() => {
            setIsViewModalOpen(false);
            setReplyMessage(selectedInquiry.repliedMessage || '');
            setIsReplyModalOpen(true);
          }}>
                Reply to Inquiry
              </Button>
            </div>
          </div>}
      </Modal>
      {/* Reply Modal */}
      <Modal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)} title="Reply to Inquiry" size="lg">
        {selectedInquiry && <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <span>{selectedInquiry.customerEmail}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <span>Re: {selectedInquiry.subject}</span>
              </div>
            </div>
            <div>
              <label htmlFor="reply-message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea id="reply-message" rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Type your reply here..." value={replyMessage || `Dear ${selectedInquiry.customerName},\n\nThank you for contacting EcoClean regarding your inquiry about "${selectedInquiry.subject}".\n\n\n\nBest regards,\nCustomer Support Team\nEcoClean Waste Management`} onChange={e => setReplyMessage(e.target.value)}></textarea>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsReplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<MessageCircleIcon size={18} />}>
                Send Reply
              </Button>
            </div>
          </form>}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Inquiry">
        {selectedInquiry && <div>
            <p className="text-gray-600">
              Are you sure you want to delete the inquiry "
              {selectedInquiry.subject}" from{' '}
              <span className="font-medium">
                {selectedInquiry.customerName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => {
            // Handle delete logic
            setIsDeleteModalOpen(false);
          }}>
                Delete
              </Button>
            </div>
          </div>}
      </Modal>
        </div>
      </div>
    </div>
  );
};

export default InquiryManager;