import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, FilterIcon, TrashIcon, UserIcon, MailIcon, ImageIcon, EyeIcon, UserPlusIcon, ShieldIcon } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';

interface Customer {
  id: number;
  name: string;
  email: string;
  imageURL?: string;
  role: 'admin' | 'user' | 'staff';
  status: 'Active' | 'Inactive' | 'Pending';
}

const CustomerManager = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:5000/api/personnel/getAllCustomers', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();
        const mapped = (data.users || []).map((user: any) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          imageURL: user.imageUrl,
          role: user.role ? user.role.toLowerCase() : 'user',
          status: 'Active', // Default, since not provided by backend
        }));
        setCustomers(mapped);
      } catch (err) {
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, []);
  const columns = [{
    header: 'Name',
    accessor: 'name',
    cell: (value: string, row: Customer) => <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 mr-3">
            {row.imageURL ? <img className="h-10 w-10 rounded-full" src={row.imageURL} alt={row.name} /> : <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon size={18} className="text-gray-500" />
              </div>}
          </div>
          <div className="font-medium text-gray-900">{value}</div>
        </div>
  }, {
    header: 'Email',
    accessor: 'email',
    cell: (value: string) => <div className="flex items-center">
          <MailIcon size={14} className="mr-1 text-gray-400" />
          <span>{value}</span>
        </div>
  }, {
    header: 'Image',
    accessor: 'imageURL',
    cell: (value: string | undefined) => value ? <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src={value} alt="Customer" className="w-full h-full object-cover" />
          </div> : <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <ImageIcon size={16} className="text-gray-400" />
          </div>
  }, {
    header: 'Role',
    accessor: 'role',
    cell: (value: string) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'admin' ? 'bg-purple-100 text-purple-800' : value === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          {value === 'admin' ? 'Admin' : value === 'staff' ? 'Staff' : 'Customer'}
        </span>
  }, {
    header: 'Actions',
    accessor: 'id',
    cell: (value: number, row: Customer) => <div className="flex space-x-2">
          <Button variant="outline" size="sm" icon={<EyeIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedCustomer(row);
        setIsViewModalOpen(true);
      }}>
            View
          </Button>
          <Button variant="danger" size="sm" icon={<TrashIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedCustomer(row);
        setIsDeleteModalOpen(true);
      }}>
            Delete
          </Button>
        </div>
  }];
  const filteredCustomers = customers.filter(customer => (statusFilter === 'all' || customer.status === statusFilter) && (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.email.toLowerCase().includes(searchTerm.toLowerCase())));
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Customer Management
        </h1>
        <Button variant="primary" icon={<UserPlusIcon size={18} />} onClick={() => setIsAddModalOpen(true)}>
          Add New Customer
        </Button>
      </div>
      <Card>
        <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="relative">
            <input type="text" placeholder="Search customers..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
            <Button variant="outline" icon={<FilterIcon size={18} />}>
              More Filters
            </Button>
          </div>
        </div>
        <Table columns={columns} data={filteredCustomers} onRowClick={row => {
        setSelectedCustomer(row);
        setIsViewModalOpen(true);
      }} />
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {filteredCustomers.length} of {customers.length} customers
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
      {/* View Customer Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Customer Details" size="lg">
        {selectedCustomer && <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                {selectedCustomer.imageURL ? <img className="h-full w-full object-cover" src={selectedCustomer.imageURL} alt={selectedCustomer.name} /> : <div className="h-full w-full flex items-center justify-center">
                    <UserIcon size={32} className="text-gray-500" />
                  </div>}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-medium text-gray-800">
                  {selectedCustomer.name}
                </h3>
                <p className="text-gray-600">{selectedCustomer.email}</p>
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedCustomer.role === 'admin' ? 'bg-purple-100 text-purple-800' : selectedCustomer.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {selectedCustomer.role === 'admin' ? 'Admin' : selectedCustomer.role === 'staff' ? 'Staff' : 'Customer'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedCustomer.status === 'Active' ? 'bg-green-100 text-green-800' : selectedCustomer.status === 'Inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>}
      </Modal>
      {/* Add Customer Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Customer" size="lg">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input type="text" id="name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter name" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input type="email" id="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter email address" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="imageURL" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input type="text" id="imageURL" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter image URL (optional)" />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select id="role" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="user">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select id="status" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Customer
            </Button>
          </div>
        </form>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Customer">
        {selectedCustomer && <div>
            <p className="text-gray-600">
              Are you sure you want to delete the customer{' '}
              <span className="font-medium">{selectedCustomer.name}</span>? This
              action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={async () => {
          if (!selectedCustomer) return;
          try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5000/api/personnel/deleteCustomer/${selectedCustomer.id}`, {
              method: 'DELETE',
              headers: {
                Authorization: token ? `Bearer ${token}` : '',
              },
            });
            if (!res.ok) throw new Error('Failed to delete customer');
            setIsDeleteModalOpen(false);
            setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));
          } catch (err) {
            alert('Failed to delete customer.');
          }
        }}>
                Delete
              </Button>
            </div>
          </div>}
      </Modal>
    </div>;
};
export default CustomerManager;