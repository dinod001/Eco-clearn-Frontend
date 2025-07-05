import React, { useState } from 'react';
import { PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, CheckIcon, XIcon, DollarSignIcon, CalendarIcon } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
interface Purchase {
  id: number;
  amount: number;
  paymentStage: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  date: string;
  customer: string;
  reference: string;
}
const PurchaseManager = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStageFilter, setPaymentStageFilter] = useState('all');
  // Sample data
  const purchases: Purchase[] = [{
    id: 1,
    amount: 25000,
    paymentStage: 'Full Payment',
    status: 'Completed',
    date: '2023-09-20',
    customer: 'Green Tech Solutions',
    reference: 'PUR-2023-001'
  }, {
    id: 2,
    amount: 15000,
    paymentStage: 'Partial Payment',
    status: 'Processing',
    date: '2023-09-19',
    customer: 'Colombo Hospital',
    reference: 'PUR-2023-002'
  }, {
    id: 3,
    amount: 50000,
    paymentStage: 'Advance Payment',
    status: 'Pending',
    date: '2023-09-18',
    customer: 'Lakeside Hotel',
    reference: 'PUR-2023-003'
  }, {
    id: 4,
    amount: 8000,
    paymentStage: 'No Payment',
    status: 'Cancelled',
    date: '2023-09-17',
    customer: 'Tech Park',
    reference: 'PUR-2023-004'
  }, {
    id: 5,
    amount: 12000,
    paymentStage: 'Full Payment',
    status: 'Completed',
    date: '2023-09-16',
    customer: 'City Mall',
    reference: 'PUR-2023-005'
  }, {
    id: 6,
    amount: 30000,
    paymentStage: 'Partial Payment',
    status: 'Processing',
    date: '2023-09-15',
    customer: 'Beach Resort',
    reference: 'PUR-2023-006'
  }];
  const paymentStages = ['Full Payment', 'Partial Payment', 'Advance Payment', 'No Payment'];
  const columns = [{
    header: 'Reference',
    accessor: 'reference'
  }, {
    header: 'Customer',
    accessor: 'customer'
  }, {
    header: 'Amount',
    accessor: 'amount',
    cell: (value: number) => <div className="flex items-center font-medium">
          <DollarSignIcon size={14} className="mr-1 text-gray-400" />
          <span>LKR {value.toLocaleString()}</span>
        </div>
  }, {
    header: 'Payment Stage',
    accessor: 'paymentStage',
    cell: (value: string) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'Full Payment' ? 'bg-green-100 text-green-800' : value === 'Partial Payment' ? 'bg-blue-100 text-blue-800' : value === 'Advance Payment' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
          {value}
        </span>
  }, {
    header: 'Status',
    accessor: 'status',
    cell: (value: string) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'Completed' ? 'bg-green-100 text-green-800' : value === 'Processing' ? 'bg-blue-100 text-blue-800' : value === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {value}
        </span>
  }, {
    header: 'Date',
    accessor: 'date',
    cell: (value: string) => <div className="flex items-center">
          <CalendarIcon size={14} className="mr-1 text-gray-400" />
          {new Date(value).toLocaleDateString()}
        </div>
  }, {
    header: 'Actions',
    accessor: 'id',
    cell: (value: number, row: Purchase) => <div className="flex space-x-2">
          <Button variant="outline" size="sm" icon={<EditIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedPurchase(row);
        setIsEditModalOpen(true);
      }}>
            Edit
          </Button>
          <Button variant="danger" size="sm" icon={<TrashIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedPurchase(row);
        setIsDeleteModalOpen(true);
      }}>
            Delete
          </Button>
        </div>
  }];
  const filteredPurchases = purchases.filter(purchase => (statusFilter === 'all' || purchase.status === statusFilter) && (paymentStageFilter === 'all' || purchase.paymentStage === paymentStageFilter) && (purchase.reference.toLowerCase().includes(searchTerm.toLowerCase()) || purchase.customer.toLowerCase().includes(searchTerm.toLowerCase())));
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Purchase Management
        </h1>
        <Button variant="primary" icon={<PlusIcon size={18} />} onClick={() => setIsAddModalOpen(true)}>
          Add New Purchase
        </Button>
      </div>
      <Card>
        <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="relative">
            <input type="text" placeholder="Search purchases..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <select value={paymentStageFilter} onChange={e => setPaymentStageFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="all">All Payment Stages</option>
              {paymentStages.map(stage => <option key={stage} value={stage}>
                  {stage}
                </option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <Button variant="outline" icon={<FilterIcon size={18} />}>
              More Filters
            </Button>
          </div>
        </div>
        <Table columns={columns} data={filteredPurchases} onRowClick={row => {
        setSelectedPurchase(row);
        setIsViewModalOpen(true);
      }} />
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {filteredPurchases.length} of {purchases.length} purchases
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
      {/* View Purchase Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Purchase Details" size="lg">
        {selectedPurchase && <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  Reference: {selectedPurchase.reference}
                </h3>
                <p className="text-gray-600">{selectedPurchase.customer}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedPurchase.status === 'Completed' ? 'bg-green-100 text-green-800' : selectedPurchase.status === 'Processing' ? 'bg-blue-100 text-blue-800' : selectedPurchase.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {selectedPurchase.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <div className="mt-1 text-xl font-semibold text-gray-800 flex items-center">
                  <DollarSignIcon size={20} className="mr-1 text-gray-400" />
                  <span>LKR {selectedPurchase.amount.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Payment Stage
                </p>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${selectedPurchase.paymentStage === 'Full Payment' ? 'bg-green-100 text-green-800' : selectedPurchase.paymentStage === 'Partial Payment' ? 'bg-blue-100 text-blue-800' : selectedPurchase.paymentStage === 'Advance Payment' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {selectedPurchase.paymentStage}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <div className="mt-1 flex items-center text-gray-700">
                  <CalendarIcon size={16} className="mr-1 text-gray-400" />
                  <span>
                    {new Date(selectedPurchase.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-2 text-gray-700">Update Status</h4>
              <div className="flex space-x-2">
                <Button size="sm" variant={selectedPurchase.status === 'Pending' ? 'primary' : 'outline'}>
                  Mark as Pending
                </Button>
                <Button size="sm" variant={selectedPurchase.status === 'Processing' ? 'primary' : 'outline'}>
                  Mark as Processing
                </Button>
                <Button size="sm" variant={selectedPurchase.status === 'Completed' ? 'success' : 'outline'}>
                  Mark as Completed
                </Button>
                <Button size="sm" variant={selectedPurchase.status === 'Cancelled' ? 'danger' : 'outline'}>
                  Mark as Cancelled
                </Button>
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
                Edit Purchase
              </Button>
            </div>
          </div>}
      </Modal>
      {/* Add Purchase Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Purchase" size="lg">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <input type="text" id="reference" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter reference number" />
            </div>
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <input type="text" id="customer" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter customer name" />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (LKR)
              </label>
              <input type="number" id="amount" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter amount" />
            </div>
            <div>
              <label htmlFor="paymentStage" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Stage
              </label>
              <select id="paymentStage" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">Select payment stage</option>
                {paymentStages.map(stage => <option key={stage} value={stage}>
                    {stage}
                  </option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select id="status" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input type="date" id="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Purchase
            </Button>
          </div>
        </form>
      </Modal>
      {/* Edit Purchase Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Purchase" size="lg">
        {selectedPurchase && <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-reference" className="block text-sm font-medium text-gray-700 mb-1">
                  Reference
                </label>
                <input type="text" id="edit-reference" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedPurchase.reference} />
              </div>
              <div>
                <label htmlFor="edit-customer" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <input type="text" id="edit-customer" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedPurchase.customer} />
              </div>
              <div>
                <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (LKR)
                </label>
                <input type="number" id="edit-amount" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedPurchase.amount} />
              </div>
              <div>
                <label htmlFor="edit-paymentStage" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Stage
                </label>
                <select id="edit-paymentStage" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedPurchase.paymentStage}>
                  {paymentStages.map(stage => <option key={stage} value={stage}>
                      {stage}
                    </option>)}
                </select>
              </div>
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select id="edit-status" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedPurchase.status}>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input type="date" id="edit-date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedPurchase.date} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update Purchase
              </Button>
            </div>
          </form>}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Purchase">
        {selectedPurchase && <div>
            <p className="text-gray-600">
              Are you sure you want to delete the purchase with reference{' '}
              <span className="font-medium">{selectedPurchase.reference}</span>?
              This action cannot be undone.
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
    </div>;
};
export default PurchaseManager;