import { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon, EditIcon, TrashIcon, ClipboardCheckIcon, PhoneIcon, MapPinIcon, CalendarIcon, DollarSignIcon, AlertCircleIcon, UserIcon, CheckCircleIcon, XCircleIcon, XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Toast Notification Types
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

// Toast Component
const ToastNotification = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon size={22} className="text-green-600" />;
      case 'error':
        return <XCircleIcon size={22} className="text-red-600" />;
      case 'warning':
        return <AlertCircleIcon size={22} className="text-yellow-600" />;
      default:
        return <AlertCircleIcon size={22} className="text-blue-600" />;
    }
  };

  const getToastColors = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900 shadow-green-100';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900 shadow-red-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900 shadow-yellow-100';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900 shadow-blue-100';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 6000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`min-w-[320px] max-w-md w-full ${getToastColors()} border rounded-xl shadow-xl p-4 mb-2 backdrop-blur-sm`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {getToastIcon()}
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-bold">{toast.title}</p>
          <p className="text-sm mt-1 opacity-90 leading-relaxed">{toast.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
            onClick={() => onRemove(toast.id)}
          >
            <span className="sr-only">Dismiss</span>
            <XIcon size={16} />
          </button>
        </div>
      </div>
      
      <motion.div
        className="mt-3 h-1 bg-black bg-opacity-10 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full bg-current opacity-30 rounded-full"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 6, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};
interface ServiceRequest {
  id: string;
  serviceName: string;
  userName: string;
  contact: string;
  location: string;
  date: string;
  advance: number;
  price: number;
  balance: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  staff: string[];
  userId: string;
}
interface Employee {
  id: string;
  fullName: string;
}
const ServiceRequestManager = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advancePercent, setAdvancePercent] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<string>('Pending');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast helper functions
  const addToast = (type: ToastType, title: string, message: string) => {
    const newToast: Toast = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    // Fetch service requests
    const fetchServiceRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/personnel/getall-bookings`);
        const apiRequests = response.data.allBookings;
        const mappedRequests: ServiceRequest[] = apiRequests.map((req: any) => ({
          id: req._id,
          serviceName: req.serviceName || '',
          userName: req.userName || '',
          contact: req.contact || '',
          location: req.location || '',
          date: req.date || '',
          advance: req.advance || 0,
          price: req.price || 0,
          balance: req.balance || 0,
          status: req.status || 'Pending',
          staff: req.staff || [],
          userId: req.userId || '',
        }));
        setServiceRequests(mappedRequests);
      } catch (err: any) {
        addToast('error', 'Loading Failed', err.response?.data?.message || 'Failed to fetch service requests');
      } finally {
        setLoading(false);
      }
    };
    fetchServiceRequests();
    // Fetch employees for staff selection
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/personnel/all-employees`);
        const apiEmployees = response.data.data;
        const mappedEmployees: Employee[] = apiEmployees.map((emp: any) => ({
          id: emp._id,
          fullName: emp.fullName || '',
        }));
        setEmployees(mappedEmployees);
      } catch {
        addToast('warning', 'No Employees', 'Failed to load employees for staff assignment');
      }
    };
    fetchEmployees();
  }, []);
  // In edit modal, set selectedStaff when opening
  useEffect(() => {
    if (selectedRequest && selectedRequest.staff) {
      setSelectedStaff(selectedRequest.staff);
    } else {
      setSelectedStaff([]);
    }
  }, [selectedRequest, isEditModalOpen]);
  useEffect(() => {
    if (selectedRequest) {
      setAdvancePercent(
        selectedRequest.price > 0 && selectedRequest.advance > 0
          ? Math.round((selectedRequest.advance / selectedRequest.price) * 100)
          : 0
      );
    } else {
      setAdvancePercent(0);
    }
  }, [selectedRequest, isEditModalOpen]);
  useEffect(() => {
    if (selectedRequest) {
      setEditStatus(selectedRequest.status);
    }
  }, [selectedRequest, isEditModalOpen]);
  const columns = [{
    header: 'Service Name',
    accessor: 'serviceName'
  }, {
    header: 'User Name',
    accessor: 'userName'
  }, {
    header: 'Contact',
    accessor: 'contact',
    cell: (value: string) => <div className="flex items-center">
          <PhoneIcon size={14} className="mr-1 text-gray-400" />
          <span>{value}</span>
        </div>
  }, {
    header: 'Location',
    accessor: 'location',
    cell: (value: string) => <div className="flex items-center">
          <MapPinIcon size={14} className="mr-1 text-gray-400" />
          <span>{value}</span>
        </div>
  }, {
    header: 'Date',
    accessor: 'date',
    cell: (value: string) => <div className="flex items-center">
          <CalendarIcon size={14} className="mr-1 text-gray-400" />
          {new Date(value).toLocaleDateString()}
        </div>
  }, {
    header: 'Advance',
    accessor: 'advance',
    cell: (value: number) => <div className="flex items-center">
          <DollarSignIcon size={14} className="mr-1 text-blue-400" />
          <span>LKR {value.toLocaleString()}</span>
        </div>
  }, {
    header: 'Price',
    accessor: 'price',
    cell: (value: number) => <div className="flex items-center">
          <DollarSignIcon size={14} className="mr-1 text-gray-400" />
          <span>LKR {value.toLocaleString()}</span>
        </div>
  }, {
    header: 'Balance',
    accessor: 'balance',
    cell: (value: number) => <div className="flex items-center">
          <DollarSignIcon size={14} className="mr-1 text-gray-400" />
          <span>LKR {value.toLocaleString()}</span>
        </div>
  }, {
    header: 'Status',
    accessor: 'status',
    cell: (value: string) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'Completed' ? 'bg-green-100 text-green-800' : value === 'Pending' ? 'bg-yellow-100 text-yellow-800' : value === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
          {value}
        </span>
  }, {
    header: 'Actions',
    accessor: 'id',
    cell: (_: any, row: ServiceRequest) => <div className="flex space-x-2">
          <Button variant="outline" size="sm" icon={<ClipboardCheckIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedRequest(row);
        setIsViewModalOpen(true);
      }}>
            View
          </Button>
          <Button variant="outline" size="sm" icon={<EditIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedRequest(row);
        setIsEditModalOpen(true);
      }}>
            Edit
          </Button>
          <Button variant="danger" size="sm" icon={<TrashIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedRequest(row);
        setIsDeleteModalOpen(true);
      }}>
            Delete
          </Button>
        </div>
  }];
  const filteredRequests = serviceRequests.filter(request => (statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase()) && (request.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) || request.userName.toLowerCase().includes(searchTerm.toLowerCase()) || request.location.toLowerCase().includes(searchTerm.toLowerCase()) || request.contact.includes(searchTerm)));
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <ClipboardCheckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Service Books</p>
                <p className="text-2xl font-bold text-gray-900">{serviceRequests.length}</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertCircleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequests.filter(r => r.status === 'Pending').length}
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <ClipboardCheckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequests.filter(r => r.status === 'In Progress').length}
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequests.filter(r => r.status === 'Completed').length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title - Left Side */}
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mr-4">
                <ClipboardCheckIcon size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
                  Service Books Management
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Manage and track all service bookings and requests
                </p>
              </div>
            </div>
            
            {/* Search Bar - Right Side */}
            <div className="flex-shrink-0 w-full max-w-md">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search service books..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                />
                <SearchIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {loading ? (
            <div className="py-16 text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
              </div>
              <p className="text-gray-600 text-lg font-medium">Loading service requests...</p>
              <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircleIcon size={32} className="text-red-500" />
              </div>
              <p className="text-red-600 text-lg font-medium">{error}</p>
              <p className="text-gray-400 text-sm mt-1">Please try refreshing the page</p>
            </div>
          ) : (
            <div className="px-8 pt-6 pb-8">
              {/* Enhanced Filter Controls */}
              <div className="flex flex-col sm:flex-row justify-start gap-3 mb-6">
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)} 
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors shadow-sm min-w-[160px]"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button variant="outline" icon={<FilterIcon size={18} />} className="px-6 py-3 shadow-sm">
                  More Filters
                </Button>
              </div>

              {/* Enhanced Table */}
              <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                <Table columns={columns} data={filteredRequests} onRowClick={row => {
                  setSelectedRequest(row);
                  setIsViewModalOpen(true);
                }} />
              </div>

              {/* Enhanced Pagination */}
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-500 font-medium">
                  Showing {filteredRequests.length} of {serviceRequests.length} service books
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="px-4 py-2">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-green-50 border-green-500 text-green-600 px-4 py-2">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="px-4 py-2">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Enhanced View Service Request Modal */}
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="" size="lg">
          {selectedRequest && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 -m-6 p-8 rounded-t-lg">
              {/* Header Section */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Service Book Details</h2>
                  <p className="text-gray-600">Complete information about this service booking</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ClipboardCheckIcon size={28} className="text-blue-600" />
                </div>
              </div>

              {/* Information Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Service Information Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <UserIcon size={20} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Service Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Service Name</span>
                      <span className="text-lg font-bold text-gray-800">{selectedRequest.serviceName}</span>
                    </div>
                    <div className="flex flex-col py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Customer Name</span>
                      <span className="text-base font-medium text-gray-700">{selectedRequest.userName}</span>
                    </div>
                    <div className="flex flex-col py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Contact</span>
                      <div className="flex items-center text-gray-700">
                        <PhoneIcon size={16} className="mr-2 text-gray-400" />
                        {selectedRequest.contact}
                      </div>
                    </div>
                    <div className="flex flex-col py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Location</span>
                      <div className="flex items-center text-gray-700">
                        <MapPinIcon size={16} className="mr-2 text-gray-400" />
                        {selectedRequest.location}
                      </div>
                    </div>
                    <div className="flex flex-col py-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</span>
                      <div className="flex items-center text-gray-700">
                        <CalendarIcon size={16} className="mr-2 text-gray-400" />
                        {new Date(selectedRequest.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Information Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <DollarSignIcon size={20} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Financial Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 bg-gray-50 rounded-lg px-4">
                      <span className="text-sm font-medium text-gray-600">Status</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                        selectedRequest.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        selectedRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        selectedRequest.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 bg-gray-50 rounded-lg px-4">
                      <span className="text-sm font-medium text-gray-600">Total Price</span>
                      <span className="flex items-center text-gray-800 font-bold">
                        <DollarSignIcon size={16} className="mr-1 text-gray-400" />
                        LKR {selectedRequest.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 bg-blue-50 rounded-lg px-4">
                      <span className="text-sm font-medium text-gray-600">Advance Payment</span>
                      <span className="flex items-center text-blue-700 font-bold">
                        <DollarSignIcon size={16} className="mr-1 text-blue-400" />
                        LKR {selectedRequest.advance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 bg-red-50 rounded-lg px-4">
                      <span className="text-sm font-medium text-gray-600">Balance Due</span>
                      <span className="flex items-center text-red-700 font-bold">
                        <DollarSignIcon size={16} className="mr-1 text-red-400" />
                        LKR {selectedRequest.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Staff Section */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Staff</h3>
                {selectedRequest.staff && selectedRequest.staff.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedRequest.staff.map(staffId => {
                      const emp = employees.find(e => e.id === staffId);
                      return (
                        <div key={staffId} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-blue-100 rounded-full mr-3">
                            <UserIcon size={16} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-700">
                            {emp && emp.fullName ? emp.fullName : 
                              <span className="text-gray-400 italic">ID: {staffId}</span>
                            }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <UserIcon size={20} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No staff assigned</p>
                    <p className="text-gray-400 text-sm">Staff will be assigned during processing</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-2.5"
                >
                  Close
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="px-6 py-2.5"
                  icon={<EditIcon size={16} />}
                >
                  Edit Service Book
                </Button>
              </div>
            </div>
          )}
        </Modal>
        {/* Enhanced Edit Service Request Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Service Book" size="lg">
          {selectedRequest && (
            <form className="space-y-6" onSubmit={async e => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              try {
                const form = e.target as HTMLFormElement;
                const getValue = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement)?.value || '';
                const token = localStorage.getItem('authToken');
                const price = Number(getValue('edit-price'));
                const advance = Math.round((advancePercent / 100) * price);
                const balance = price - advance;
                
                const payload = {
                  serviceBookData: {
                    _id: selectedRequest.id,
                    userId: selectedRequest.userId,
                    userName: getValue('edit-userName'),
                    serviceName: getValue('edit-serviceName'),
                    contact: getValue('edit-contact'),
                    location: getValue('edit-location'),
                    date: getValue('edit-date'),
                    advance,
                    price,
                    balance,
                    staff: selectedStaff,
                    status: editStatus,
                  }
                };
                
                await axios.put(`${API_BASE_URL}/api/personnel/update-booking`, payload, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                setIsEditModalOpen(false);
                addToast('success', 'Service Updated', 'Service book has been updated successfully');
                
                // Refresh list
                const response = await axios.get(`${API_BASE_URL}/api/personnel/getall-bookings`);
                const apiRequests = response.data.allBookings;
                const mappedRequests: ServiceRequest[] = apiRequests.map((req: any) => ({
                  id: req._id,
                  serviceName: req.serviceName || '',
                  userName: req.userName || '',
                  contact: req.contact || '',
                  location: req.location || '',
                  date: req.date || '',
                  advance: req.advance || 0,
                  price: req.price || 0,
                  balance: req.balance || 0,
                  status: req.status || 'Pending',
                  staff: req.staff || [],
                  userId: req.userId || '',
                }));
                setServiceRequests(mappedRequests);
              } catch (err: any) {
                addToast('error', 'Update Failed', err.response?.data?.message || 'Failed to update service request');
              } finally {
                setLoading(false);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="edit-serviceName" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name
                  </label>
                  <input 
                    type="text" 
                    id="edit-serviceName" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" 
                    defaultValue={selectedRequest.serviceName} 
                  />
                </div>
                <div>
                  <label htmlFor="edit-userName" className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input 
                    type="text" 
                    id="edit-userName" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" 
                    defaultValue={selectedRequest.userName} 
                  />
                </div>
                <div>
                  <label htmlFor="edit-contact" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact
                  </label>
                  <input 
                    type="text" 
                    id="edit-contact" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" 
                    defaultValue={selectedRequest.contact} 
                  />
                </div>
                <div>
                  <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input 
                    type="text" 
                    id="edit-location" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" 
                    defaultValue={selectedRequest.location} 
                  />
                </div>
                <div>
                  <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input 
                    type="date" 
                    id="edit-date" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors" 
                    defaultValue={selectedRequest.date ? selectedRequest.date.slice(0, 10) : ''} 
                  />
                </div>
                <div>
                  <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="edit-status"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price (LKR)
                  </label>
                  <input
                    type="number"
                    id="edit-price"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    defaultValue={selectedRequest.price}
                  />
                </div>
                <div>
                  <label htmlFor="edit-advance-percent" className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Percentage (%)
                  </label>
                  <input
                    type="number"
                    id="edit-advance-percent"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    value={advancePercent}
                    min={0}
                    max={100}
                    onChange={e => setAdvancePercent(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label htmlFor="edit-advance" className="block text-sm font-medium text-gray-700 mb-2">
                    Advance (LKR)
                  </label>
                  <input
                    type="number"
                    id="edit-advance"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                    value={Math.round((advancePercent / 100) * (selectedRequest.price || 0))}
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="edit-balance" className="block text-sm font-medium text-gray-700 mb-2">
                    Balance (LKR)
                  </label>
                  <input
                    type="number"
                    id="edit-balance"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                    value={selectedRequest.price - Math.round((advancePercent / 100) * (selectedRequest.price || 0))}
                    disabled
                    readOnly
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="edit-staff" className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Staff
                  </label>
                  <select
                    id="edit-staff"
                    multiple
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors h-32"
                    value={selectedStaff}
                    onChange={e => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      const uniqueOptions = Array.from(new Set(options));
                      setSelectedStaff(uniqueOptions);
                    }}
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple staff members</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2.5"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  className="px-6 py-2.5"
                >
                  Update Service Book
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Enhanced Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Service Book">
          {selectedRequest && (
            <div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircleIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      This action cannot be undone. This will permanently delete the service book record.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Service Book Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Service:</span>
                    <p className="text-gray-900">{selectedRequest.serviceName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Customer:</span>
                    <p className="text-gray-900">{selectedRequest.userName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Total Amount:</span>
                    <p className="text-gray-900">LKR {selectedRequest.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <p className="text-gray-900">{selectedRequest.status}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this service book? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-6 py-2.5"
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const token = localStorage.getItem('authToken');
                      await axios.delete(`${API_BASE_URL}/api/personnel/delete-booking/${selectedRequest.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      setIsDeleteModalOpen(false);
                      addToast('success', 'Service Deleted', 'Service book has been deleted successfully');
                      
                      // Refresh list
                      const response = await axios.get(`${API_BASE_URL}/api/personnel/getall-bookings`);
                      const apiRequests = response.data.allBookings;
                      const mappedRequests: ServiceRequest[] = apiRequests.map((req: any) => ({
                        id: req._id,
                        serviceName: req.serviceName || '',
                        userName: req.userName || '',
                        contact: req.contact || '',
                        location: req.location || '',
                        date: req.date || '',
                        advance: req.advance || 0,
                        price: req.price || 0,
                        balance: req.balance || 0,
                        status: req.status || 'Pending',
                        staff: req.staff || [],
                        userId: req.userId || '',
                      }));
                      setServiceRequests(mappedRequests);
                    } catch (err: any) {
                      addToast('error', 'Delete Failed', err.response?.data?.message || 'Failed to delete service request');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-6 py-2.5"
                >
                  Delete Service Book
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
export default ServiceRequestManager;