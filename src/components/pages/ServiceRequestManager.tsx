import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, CheckIcon, XIcon, ClipboardCheckIcon, PhoneIcon, MapPinIcon, CalendarIcon, DollarSignIcon } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
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
        setError(err.response?.data?.message || 'Failed to fetch service requests');
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
      } catch {}
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
    cell: (value: number, row: ServiceRequest) => <div className="flex space-x-2">
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
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Service Books Management
        </h1>
      </div>
      <Card>
        {loading ? <div className="py-8 text-center text-gray-500">Loading service requests...</div> : error ? <div className="py-8 text-center text-red-500">{error}</div> : <>
        <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="relative">
            <input type="text" placeholder="Search service books..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="flex space-x-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" icon={<FilterIcon size={18} />}>
              More Filters
            </Button>
          </div>
        </div>
        <Table columns={columns} data={filteredRequests} onRowClick={row => {
        setSelectedRequest(row);
        setIsViewModalOpen(true);
      }} />
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {filteredRequests.length} of {serviceRequests.length}{' '}
            service books
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
        </>}
      </Card>
      {/* View Service Request Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Service Book Details" size="lg">
        {selectedRequest && <div className="space-y-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Service Name</div>
                <div className="text-lg font-bold text-gray-800">{selectedRequest.serviceName}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-4">User Name</div>
                <div className="text-base font-medium text-gray-700">{selectedRequest.userName}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-4">Contact</div>
                <div className="flex items-center text-gray-700"><PhoneIcon size={16} className="mr-2 text-gray-400" />{selectedRequest.contact}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-4">Location</div>
                <div className="flex items-center text-gray-700"><MapPinIcon size={16} className="mr-2 text-gray-400" />{selectedRequest.location}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-4">Date</div>
                <div className="flex items-center text-gray-700"><CalendarIcon size={16} className="mr-2 text-gray-400" />{new Date(selectedRequest.date).toLocaleDateString()}</div>
              </div>
              <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase">Status</span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${selectedRequest.status === 'Completed' ? 'bg-green-100 text-green-800' : selectedRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : selectedRequest.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{selectedRequest.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase">Price</span>
                  <span className="flex items-center text-gray-800 font-bold"><DollarSignIcon size={16} className="mr-1 text-gray-400" />LKR {selectedRequest.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase">Advance</span>
                  <span className="flex items-center text-blue-700 font-bold"><DollarSignIcon size={16} className="mr-1 text-blue-400" />LKR {selectedRequest.advance.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase">Balance</span>
                  <span className="flex items-center text-red-700 font-bold"><DollarSignIcon size={16} className="mr-1 text-red-400" />LKR {selectedRequest.balance.toLocaleString()}</span>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-gray-400 uppercase mb-1">Assigned Staff</div>
                  {selectedRequest.staff && selectedRequest.staff.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-700 ml-4">
                      {selectedRequest.staff.map(staffId => {
                        const emp = employees.find(e => e.id === staffId);
                        return (
                          <li key={staffId} className="mb-1">
                            {emp && emp.fullName ? emp.fullName : <span className="text-gray-400 italic">{staffId}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-gray-400 italic">No staff assigned.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => {
                setIsViewModalOpen(false);
                setIsEditModalOpen(true);
              }}>
                Edit Service Book
              </Button>
            </div>
          </div>}
      </Modal>
      {/* Edit Service Request Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Service Book" size="lg">
        {selectedRequest && <form className="space-y-4" onSubmit={async e => {
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
            // Always use selectedStaff for staff update
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
            setError(err.response?.data?.message || 'Failed to update service request');
          } finally {
            setLoading(false);
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-serviceName" className="block text-sm font-medium text-gray-700 mb-1">
                Service Name
              </label>
              <input type="text" id="edit-serviceName" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedRequest.serviceName} />
            </div>
            <div>
              <label htmlFor="edit-userName" className="block text-sm font-medium text-gray-700 mb-1">
                User Name
              </label>
              <input type="text" id="edit-userName" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedRequest.userName} />
            </div>
            <div>
              <label htmlFor="edit-contact" className="block text-sm font-medium text-gray-700 mb-1">
                Contact
              </label>
              <input type="text" id="edit-contact" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedRequest.contact} />
            </div>
            <div>
              <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input type="text" id="edit-location" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedRequest.location} />
            </div>
            <div>
              <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input type="date" id="edit-date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedRequest.date ? selectedRequest.date.slice(0, 10) : ''} />
            </div>
            <div>
              <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="edit-status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (LKR)
              </label>
              <input
                type="number"
                id="edit-price"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                defaultValue={selectedRequest.price}
                onChange={e => {
                  const price = Number(e.target.value);
                  setAdvancePercent(advancePercent); // keep percent
                }}
              />
            </div>
            <div>
              <label htmlFor="edit-advance-percent" className="block text-sm font-medium text-gray-700 mb-1">
                Advance Percentage (%)
              </label>
              <input
                type="number"
                id="edit-advance-percent"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={advancePercent}
                min={0}
                max={100}
                onChange={e => setAdvancePercent(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="edit-advance" className="block text-sm font-medium text-gray-700 mb-1">
                Advance (LKR)
              </label>
              <input
                type="number"
                id="edit-advance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-100"
                value={Math.round((advancePercent / 100) * (selectedRequest.price || 0))}
                disabled
                readOnly
              />
            </div>
            <div>
              <label htmlFor="edit-balance" className="block text-sm font-medium text-gray-700 mb-1">
                Balance (LKR)
              </label>
              <input
                type="number"
                id="edit-balance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-100"
                value={selectedRequest.price - Math.round((advancePercent / 100) * (selectedRequest.price || 0))}
                disabled
                readOnly
              />
            </div>
            <div>
              <label htmlFor="edit-staff" className="block text-sm font-medium text-gray-700 mb-1">
                Staff
              </label>
              <select
                id="edit-staff"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={selectedStaff}
                onChange={e => {
                  // Remove duplicates
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  const uniqueOptions = Array.from(new Set(options));
                  setSelectedStaff(uniqueOptions);
                }}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Service Book
            </Button>
          </div>
        </form>}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Service Book">
        {selectedRequest && <div>
            <p className="text-gray-600">
              Are you sure you want to delete the service book for{' '}
              <span className="font-medium">{selectedRequest.serviceName}</span>{' '}
              requested by{' '}
              <span className="font-medium">{selectedRequest.userName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const token = localStorage.getItem('authToken');
                  await axios.delete(`${API_BASE_URL}/api/personnel/delete-booking/${selectedRequest.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  setIsDeleteModalOpen(false);
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
                  }));
                  setServiceRequests(mappedRequests);
                } catch (err: any) {
                  setError(err.response?.data?.message || 'Failed to delete service request');
                } finally {
                  setLoading(false);
                }
              }}>
                Delete
              </Button>
            </div>
          </div>}
      </Modal>
    </div>;
};
export default ServiceRequestManager;