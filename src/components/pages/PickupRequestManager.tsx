import React, { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon, EditIcon, TrashIcon, CheckIcon, XIcon, ImageIcon, MapPinIcon, PhoneIcon, DollarSignIcon, UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
import axios from 'axios';

const PickupRequestManager = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pickupRequests, setPickupRequests] = useState<any[]>([]);
  const [editStatus, setEditStatus] = useState<string>('Pending');
  const [advancePercent, setAdvancePercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editAdvancePercent, setEditAdvancePercent] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editAdvance, setEditAdvance] = useState<number>(0);
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editAssignedStaff, setEditAssignedStaff] = useState<string[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [assignedEmployeeDetails, setAssignedEmployeeDetails] = useState<any[]>([]);

  useEffect(() => {
    const fetchPickupRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/personnel/get-all-request', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.allPickups)) {
          setPickupRequests(data.allPickups.map((req: any) => ({
            id: req._id,
            username: req.userName,
            contact: req.contact,
            location: req.location,
            imageURL: req.imageUrl,
            date: req.date ? req.date.slice(0, 10) : '',
            advance: req.advance,
            price: req.price,
            balance: req.balance,
            status: req.status,
            staff: req.staff || [], // use staff field for assigned employees
          })));
        } else {
          setPickupRequests([]);
        }
      } catch (err: any) {
        setError('Failed to fetch pickup requests');
      } finally {
        setLoading(false);
      }
    };
    fetchPickupRequests();
  }, []);

  useEffect(() => {
    // Fetch employees for staff assignment
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/personnel/all-employees', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setEmployees(data.data);
        } else {
          setEmployees([]);
        }
      } catch (err) {
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedRequest && isEditModalOpen) {
      setEditStatus(selectedRequest.status);
      setEditPrice(selectedRequest.price);
      // Calculate advance percent from advance and price
      const percent = selectedRequest.price ? Math.round((selectedRequest.advance / selectedRequest.price) * 100) : 0;
      setEditAdvancePercent(percent);
      setEditAdvance(selectedRequest.advance);
      setEditBalance(selectedRequest.balance);
      setEditAssignedStaff(selectedRequest.staff || []); // use staff field
    }
  }, [selectedRequest, isEditModalOpen]);

  // When price or percent changes, recalculate advance and balance
  useEffect(() => {
    const adv = Math.round((editPrice * editAdvancePercent) / 100);
    setEditAdvance(adv);
    setEditBalance(editPrice - adv);
  }, [editPrice, editAdvancePercent]);

  useEffect(() => {
    // Fetch details for assigned employees when view modal opens
    const fetchAssignedEmployees = async () => {
      if (selectedRequest && isViewModalOpen && selectedRequest.staff && selectedRequest.staff.length > 0) {
        try {
          const token = localStorage.getItem('authToken');
          const details = await Promise.all(selectedRequest.staff.map(async (id: string) => {
            const res = await fetch(`http://localhost:5000/api/personnel/get-employee/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            return data.success ? data.data : null;
          }));
          setAssignedEmployeeDetails(details.filter(Boolean));
        } catch {
          setAssignedEmployeeDetails([]);
        }
      } else {
        setAssignedEmployeeDetails([]);
      }
    };
    fetchAssignedEmployees();
  }, [selectedRequest, isViewModalOpen]);

  const columns = [{
    header: 'Username',
    accessor: 'username',
    cell: (value: string) => <div className="flex items-center">
          <UserIcon size={16} className="mr-2 text-gray-400" />
          <span>{value}</span>
        </div>
  }, {
    header: 'Contact',
    accessor: 'contact',
    cell: (value: string) => <div className="flex items-center">
          <PhoneIcon size={16} className="mr-2 text-gray-400" />
          <span>{value}</span>
        </div>
  }, {
    header: 'Location',
    accessor: 'location',
    cell: (value: string) => <div className="flex items-center">
          <MapPinIcon size={16} className="mr-2 text-gray-400" />
          <span>{value}</span>
        </div>
  }, {
    header: 'Date',
    accessor: 'date'
  }, {
    header: 'Price',
    accessor: 'price',
    cell: (value: number) => <div className="flex items-center">
          <DollarSignIcon size={16} className="mr-1 text-gray-400" />
          <span>LKR {value.toLocaleString()}</span>
        </div>
  }, {
    header: 'Balance',
    accessor: 'balance',
    cell: (value: number) => <div className="flex items-center">
          <DollarSignIcon size={16} className="mr-1 text-gray-400" />
          <span>LKR {value.toLocaleString()}</span>
        </div>
  }, {
    header: 'Status',
    accessor: 'status',
    cell: (value: string) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'Completed' ? 'bg-green-100 text-green-800' : value === 'Pending' ? 'bg-yellow-100 text-yellow-800' : value === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{value}</span>
  }, {
    header: 'Actions',
    accessor: 'id',
    cell: (value: number, row: any) => <div className="flex space-x-2">
      <Button variant="outline" size="sm" icon={<EditIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedRequest(row);
        setIsEditModalOpen(true);
      }}>
        Edit
      </Button>
      <Button variant="outline" size="sm" icon={<CheckIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedRequest(row);
        setIsViewModalOpen(true);
      }}>
        View
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
  const filteredRequests = pickupRequests.filter(request => (statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase()) && (request.username.toLowerCase().includes(searchTerm.toLowerCase()) || request.location.toLowerCase().includes(searchTerm.toLowerCase()) || request.contact.includes(searchTerm)));
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Pickup Request Management
        </h1>
      </div>
      <Card>
        <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="relative">
            <input type="text" placeholder="Search requests..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="flex space-x-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
            </select>
            <Button variant="outline" icon={<FilterIcon size={18} />}>
              Filter
            </Button>
          </div>
        </div>
        <Table columns={columns} data={filteredRequests} onRowClick={row => {
        setSelectedRequest(row);
        setIsViewModalOpen(true);
      }} />
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {filteredRequests.length} of {pickupRequests.length}{' '}
            requests
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-green-50">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
      {/* View Pickup Request Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Pickup Request Details" size="lg">
        {selectedRequest && <div className="space-y-8">
          <div className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <UserIcon size={22} className="text-green-500" />
                <div>
                  <div className="text-xs text-gray-500">Username</div>
                  <div className="text-lg font-semibold text-gray-800">{selectedRequest.username}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon size={20} className="text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500">Contact</div>
                  <div className="text-base text-gray-700">{selectedRequest.contact}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPinIcon size={20} className="text-purple-500" />
                <div>
                  <div className="text-xs text-gray-500">Location</div>
                  <div className="text-base text-gray-700">{selectedRequest.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 mr-2">Date</span>
                <span className="text-base text-gray-700">{selectedRequest.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedRequest.status === 'Completed' ? 'bg-green-100 text-green-800' : selectedRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : selectedRequest.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{selectedRequest.status}</span>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Assigned Staff</div>
                <div className="flex flex-wrap gap-2">
                  {assignedEmployeeDetails.length > 0 ? (
                    assignedEmployeeDetails.map((emp: any) => (
                      <span key={emp._id} className="inline-block bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200">{emp.fullName}</span>
                    ))
                  ) : <span className="text-xs text-gray-400">No staff assigned</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="w-full mb-4">
                <div className="text-xs text-gray-500 mb-1">Pickup Image</div>
                {selectedRequest.imageURL ? (
                  <img src={selectedRequest.imageURL} alt="Pickup location" className="w-full h-48 object-cover rounded-lg border" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon size={48} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 w-full">
                <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                  <DollarSignIcon size={20} className="text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Price</div>
                    <div className="text-lg font-semibold text-gray-800">LKR {selectedRequest.price.toLocaleString()}</div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 flex items-center space-x-3">
                  <DollarSignIcon size={20} className="text-blue-400" />
                  <div>
                    <div className="text-xs text-blue-500">Advance Payment</div>
                    <div className="text-lg font-semibold text-blue-700">LKR {selectedRequest.advance.toLocaleString()}</div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 flex items-center space-x-3">
                  <DollarSignIcon size={20} className="text-red-400" />
                  <div>
                    <div className="text-xs text-red-500">Balance</div>
                    <div className="text-lg font-semibold text-red-700">LKR {selectedRequest.balance.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => {
              setIsViewModalOpen(false);
              setIsEditModalOpen(true);
            }}>
              Edit Request
            </Button>
          </div>
        </div>}
      </Modal>
      {/* Edit Pickup Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Pickup Request" size="lg">
        {selectedRequest && <form className="space-y-4" onSubmit={async e => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          try {
            const token = localStorage.getItem('authToken');
            const formData = new FormData();
            formData.append('requestPickupData', JSON.stringify({
              userName: selectedRequest.username,
              contact: selectedRequest.contact,
              location: selectedRequest.location,
              date: selectedRequest.date,
              staff: editAssignedStaff,
              advance: editAdvance,
              price: editPrice,
              balance: editBalance
            }));
            const res = await fetch(`http://localhost:5000/api/personnel/update-request/${selectedRequest.id}`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`
              },
              body: formData
            });
            const data = await res.json();
            if (data.success) {
              // Refresh pickup requests
              const response = await fetch('http://localhost:5000/api/personnel/get-all-request', {
                headers: { Authorization: `Bearer ${token}` }
              });
              const newData = await response.json();
              if (newData.success && Array.isArray(newData.allPickups)) {
                setPickupRequests(newData.allPickups.map((req: any) => ({
                  id: req._id,
                  username: req.userName,
                  contact: req.contact,
                  location: req.location,
                  imageURL: req.imageUrl,
                  date: req.date ? req.date.slice(0, 10) : '',
                  advance: req.advance,
                  price: req.price,
                  balance: req.balance,
                  status: req.status,
                  staff: req.staff || [],
                })));
              }
              setIsEditModalOpen(false);
            } else {
              setError('Failed to update pickup request');
            }
          } catch (err: any) {
            setError('Failed to update pickup request');
          } finally {
            setLoading(false);
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input type="text" id="edit-username" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={selectedRequest.username} disabled />
            </div>
            <div>
              <label htmlFor="edit-contact" className="block text-sm font-medium text-gray-700 mb-1">
                Contact
              </label>
              <input type="text" id="edit-contact" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={selectedRequest.contact} disabled />
            </div>
            <div>
              <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input type="text" id="edit-location" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={selectedRequest.location} disabled />
            </div>
            <div>
              <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Date
              </label>
              <input type="date" id="edit-date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={selectedRequest.date} disabled />
            </div>
            <div>
              <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select id="edit-status" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
            <div>
              <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (LKR)
              </label>
              <input type="number" id="edit-price" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))} min={0} />
            </div>
            <div>
              <label htmlFor="edit-advance-percent" className="block text-sm font-medium text-gray-700 mb-1">
                Advance Percentage (%)
              </label>
              <input type="number" id="edit-advance-percent" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={editAdvancePercent} onChange={e => setEditAdvancePercent(Number(e.target.value))} min={0} max={100} />
            </div>
            <div>
              <label htmlFor="edit-advance" className="block text-sm font-medium text-gray-700 mb-1">
                Advance Payment (LKR)
              </label>
              <input type="number" id="edit-advance" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={editAdvance} disabled />
            </div>
            <div>
              <label htmlFor="edit-balance" className="block text-sm font-medium text-gray-700 mb-1">
                Balance (LKR)
              </label>
              <input type="number" id="edit-balance" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={editBalance} disabled />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="edit-assigned-staff" className="block text-sm font-medium text-gray-700 mb-1">
                Assign Staff
              </label>
              <select id="edit-assigned-staff" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" multiple value={editAssignedStaff} onChange={e => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setEditAssignedStaff(options);
              }}>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Pickup Request
            </Button>
          </div>
        </form>}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Pickup Request">
        {selectedRequest && (
          <div>
            <p className="text-gray-600">
              Are you sure you want to delete the pickup request for{' '}
              <span className="font-medium">{selectedRequest.username}</span>? This action cannot be undone.
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
                  await fetch(`http://localhost:5000/api/personnel/delete-pickup-request/${selectedRequest.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  // Refresh pickup requests
                  const response = await fetch('http://localhost:5000/api/personnel/get-all-request', {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const data = await response.json();
                  if (data.success && Array.isArray(data.allPickups)) {
                    setPickupRequests(data.allPickups.map((req: any) => ({
                      id: req._id,
                      username: req.userName,
                      contact: req.contact,
                      location: req.location,
                      imageURL: req.imageUrl,
                      date: req.date ? req.date.slice(0, 10) : '',
                      advance: req.advance,
                      price: req.price,
                      balance: req.balance,
                      status: req.status,
                      staff: req.staff || [],
                    })));
                  }
                  setIsDeleteModalOpen(false);
                } catch (err) {
                  setError('Failed to delete pickup request');
                } finally {
                  setLoading(false);
                }
              }}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>;
};

export default PickupRequestManager;