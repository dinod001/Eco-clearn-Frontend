import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, UserIcon, PhoneIcon, MailIcon, MapPinIcon, CalendarIcon, ClipboardIcon, UserPlusIcon, KeyIcon, ShieldIcon, EyeIcon, EyeOffIcon, CakeIcon, DollarSignIcon, XIcon, CheckIcon, AlertCircleIcon } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
import axios from 'axios';
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  birthday: string;
  nic: string;
  email: string;
  phone: string;
  address: string;
  monthlySalary: number;
  totalSalary: number;
  role: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  joinDate: string;
  avatar?: string;
  department?: string;
}
const EmployeeManager = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 5;
  
  const roles = ['Employee'];
  const departments = ['IT', 'Customer Service', 'Operations', 'Finance', 'HR', 'Marketing', 'Sales'];
  const columns = [{
    header: 'Employee',
    accessor: 'firstName',
    cell: (value: string, row: Employee) => <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 mr-3">
            {row.avatar ? <img className="h-10 w-10 rounded-full object-cover" src={row.avatar} alt={`${row.firstName} ${row.lastName}`} /> : <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon size={18} className="text-gray-500" />
              </div>}
          </div>
          <div>
            <div className="font-medium text-gray-900">{`${row.firstName} ${row.lastName}`}</div>
            <div className="text-gray-500 text-xs">{row.role}</div>
          </div>
        </div>
  }, {
    header: 'NIC',
    accessor: 'nic',
    cell: (value: string) => <span>{value}</span>
  }, {
    header: 'Address',
    accessor: 'address',
    cell: (value: string) => <span>{value}</span>
  }, {
    header: 'Department',
    accessor: 'department',
    cell: (value: string | undefined) => <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {value || 'Unassigned'}
        </span>
  }, {
    header: 'Contact',
    accessor: 'email',
    cell: (value: string, row: Employee) => <div>
          <div className="flex items-center text-gray-500 text-xs mb-1">
            <MailIcon size={12} className="mr-1" /> {row.email}
          </div>
          <div className="flex items-center text-gray-500 text-xs">
            <PhoneIcon size={12} className="mr-1" /> {row.phone}
          </div>
        </div>
  }, {
    header: 'Status',
    accessor: 'status',
    cell: (value: string) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'Active' ? 'bg-green-100 text-green-800' : value === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {value}
        </span>
  }, {
    header: 'Actions',
    accessor: 'id',
    cell: (value: number, row: Employee) => <div className="flex space-x-2">
          <Button variant="outline" size="sm" icon={<EyeIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedEmployee(row);
        setIsViewModalOpen(true);
      }}>
            View
          </Button>
          <Button variant="outline" size="sm" icon={<EditIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedEmployee(row);
        setIsEditModalOpen(true);
      }}>
            Edit
          </Button>
          <Button variant="danger" size="sm" icon={<TrashIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedEmployee(row);
        setIsDeleteModalOpen(true);
      }}>
            Delete
          </Button>
        </div>
  }];
  const filteredEmployees = employees.filter(employee => (roleFilter === 'all' || employee.role === roleFilter) && (statusFilter === 'all' || employee.status === statusFilter) && (departmentFilter === 'all' || employee.department === departmentFilter) && (`${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || employee.email.toLowerCase().includes(searchTerm.toLowerCase()) || employee.nic.toLowerCase().includes(searchTerm.toLowerCase()) || employee.role.toLowerCase().includes(searchTerm.toLowerCase()) || employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase())));
  // Pagination logic
  const indexOfLastEmployee = currentPage * itemsPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const handleAddEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage("");
    setError(null);
    setLoading(true);
    try {
      const form = event.target as HTMLFormElement;
      const getValue = (name: string) =>
        (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement)?.value || '';
      const fullName = getValue('firstName') + ' ' + getValue('lastName');
      const payload = {
        fullName,
        gender: getValue('gender'),
        age: Number(getValue('age')) || 0,
        birthDay: getValue('birthday'),
        nic: getValue('nic'),
        contact: getValue('phone'),
        adress: getValue('address'),
        email: getValue('email'),
        role: 'Employee',
      };
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:5000/api/personnel/create-employee', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage('Employee added successfully!');
      setIsAddModalOpen(false);
      // Refresh employee list
      const response = await axios.get('http://localhost:5000/api/personnel/all-employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiEmployees = response.data.data;
      const mappedEmployees: Employee[] = apiEmployees.map((emp: any) => ({
        id: emp._id,
        firstName: emp.fullName?.split(' ')[0] || '',
        lastName: emp.fullName?.split(' ').slice(1).join(' ') || '',
        gender: emp.gender || 'Other',
        age: emp.age || 0,
        birthday: emp.birthDay || '',
        nic: emp.nic || '',
        email: emp.email || '',
        phone: emp.contact || '',
        address: emp.adress || '',
        monthlySalary: emp.monthlySalary || 0,
        totalSalary: emp.totalSalary || 0,
        role: emp.role || '',
        status: emp.status || 'Active',
        joinDate: emp.joinDate || '',
        avatar: emp.avatar || '',
        department: emp.department || '',
      }));
      setEmployees(mappedEmployees);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateEmployee = () => {
    setSuccessMessage('Employee updated successfully!');
    setIsEditModalOpen(false);
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    setSuccessMessage("");
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5000/api/personnel/delete-employee/${selectedEmployee.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage('Employee deleted successfully!');
      setIsDeleteModalOpen(false);
      // Refresh employee list
      const response = await axios.get('http://localhost:5000/api/personnel/all-employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiEmployees = response.data.data;
      const mappedEmployees: Employee[] = apiEmployees.map((emp: any) => ({
        id: emp._id,
        firstName: emp.fullName?.split(' ')[0] || '',
        lastName: emp.fullName?.split(' ').slice(1).join(' ') || '',
        gender: emp.gender || 'Other',
        age: emp.age || 0,
        birthday: emp.birthDay || '',
        nic: emp.nic || '',
        email: emp.email || '',
        phone: emp.contact || '',
        address: emp.adress || '',
        monthlySalary: emp.monthlySalary || 0,
        totalSalary: emp.totalSalary || 0,
        role: emp.role || '',
        status: emp.status || 'Active',
        joinDate: emp.joinDate || '',
        avatar: emp.avatar || '',
        department: emp.department || '',
      }));
      setEmployees(mappedEmployees);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/personnel/all-employees', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const apiEmployees = response.data.data;
        const mappedEmployees: Employee[] = apiEmployees.map((emp: any) => ({
          id: emp._id,
          firstName: emp.fullName?.split(' ')[0] || '',
          lastName: emp.fullName?.split(' ').slice(1).join(' ') || '',
          gender: emp.gender || 'Other',
          age: emp.age || 0,
          birthday: emp.birthDay || '',
          nic: emp.nic || '',
          email: emp.email || '',
          phone: emp.contact || '',
          address: emp.adress || '',
          monthlySalary: emp.monthlySalary || 0,
          totalSalary: emp.totalSalary || 0,
          role: emp.role || '',
          status: emp.status || 'Active',
          joinDate: emp.joinDate || '',
          avatar: emp.avatar || '',
          department: emp.department || '',
        }));
        setEmployees(mappedEmployees);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Employee Management
        </h1>
        <Button variant="primary" icon={<UserPlusIcon size={18} />} onClick={() => setIsAddModalOpen(true)}>
          Add New Employee
        </Button>
      </div>
      {successMessage && <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded flex items-center justify-between">
          <div className="flex items-center">
            <CheckIcon size={18} className="text-green-500 mr-2" />
            <p className="text-green-700">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-green-500 hover:text-green-700">
            <XIcon size={18} />
          </button>
        </div>}
      <Card>
        {loading ? <div className="py-8 text-center text-gray-500">Loading employees...</div> : error ? <div className="py-8 text-center text-red-500">{error}</div> : <>
            <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="relative">
                <input type="text" placeholder="Search employees..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <Button variant="outline" icon={<FilterIcon size={18} />}>
                  More Filters
                </Button>
              </div>
            </div>
            <Table columns={columns} data={currentEmployees} onRowClick={row => {
        setSelectedEmployee(row);
        setIsViewModalOpen(true);
      }} />
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Showing {indexOfFirstEmployee + 1}-
                {Math.min(indexOfLastEmployee, filteredEmployees.length)} of{' '}
                {filteredEmployees.length} employees
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                  Previous
                </Button>
                {Array.from({
            length: totalPages
          }, (_, i) => i + 1).map(page => <Button key={page} variant="outline" size="sm" className={currentPage === page ? 'bg-green-50' : ''} onClick={() => setCurrentPage(page)}>
                {page}
              </Button>)}
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>}
      </Card>
      {/* View Employee Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Employee Details" size="lg">
        {selectedEmployee && <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                {selectedEmployee.avatar ? <img className="h-full w-full object-cover" src={selectedEmployee.avatar} alt={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`} /> : <div className="h-full w-full flex items-center justify-center">
                    <UserIcon size={32} className="text-gray-500" />
                  </div>}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-medium text-gray-800">{`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}</h3>
                <p className="text-gray-600">{selectedEmployee.role}</p>
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedEmployee.status === 'Active' ? 'bg-green-100 text-green-800' : selectedEmployee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedEmployee.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {selectedEmployee.department || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <h4 className="font-medium mb-2 text-gray-700">
                  Personal Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <CakeIcon size={16} className="mr-2 text-gray-400" />
                    <span>
                      Birthday:{' '}
                      {new Date(selectedEmployee.birthday).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="w-5 h-5 mr-2 flex items-center justify-center text-gray-400">
                      <span className="font-medium">A</span>
                    </span>
                    <span>Age: {selectedEmployee.age} years</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ShieldIcon size={16} className="mr-2 text-gray-400" />
                    <span>NIC: {selectedEmployee.nic}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-gray-700">
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MailIcon size={16} className="mr-2 text-gray-400" />
                    <span>{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon size={16} className="mr-2 text-gray-400" />
                    <span>{selectedEmployee.phone}</span>
                  </div>
                  <div className="flex items-start text-gray-600">
                    <MapPinIcon size={16} className="mr-2 mt-1 text-gray-400" />
                    <span>{selectedEmployee.address}</span>
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
                Edit Employee
              </Button>
            </div>
          </div>}
      </Modal>
      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee" size="lg">
        <form className="space-y-4" onSubmit={handleAddEmployee}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input type="text" id="firstName" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter first name" required />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input type="text" id="lastName" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter last name" required />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select id="gender" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" required>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
                Birthday *
              </label>
              <input type="date" id="birthday" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input type="number" id="age" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter age" min={0} required />
            </div>
            <div>
              <label htmlFor="nic" className="block text-sm font-medium text-gray-700 mb-1">
                NIC *
              </label>
              <input type="text" id="nic" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter NIC number" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input type="email" id="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter email address" required />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input type="tel" id="phone" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter phone number" required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea id="address" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter address" required></textarea>
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select id="role" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" required>
                <option value="Employee">Employee</option>
              </select>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="send-credentials" type="checkbox" className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="send-credentials" className="font-medium text-gray-700">
                  Create user account and send login credentials by email
                </label>
                <p className="text-gray-500">
                  The employee will receive their username and password via
                  email
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Employee
            </Button>
          </div>
        </form>
      </Modal>
      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Employee" size="lg">
        {selectedEmployee && <form className="space-y-4" onSubmit={async e => {
        e.preventDefault();
        setSuccessMessage("");
        setError(null);
        setLoading(true);
        try {
          const form = e.target as HTMLFormElement;
          const getValue = (name: string) =>
            (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement)?.value || '';
          const fullName = getValue('edit-firstName') + ' ' + getValue('edit-lastName');
          const payload = {
            fullName,
            gender: getValue('edit-gender'),
            age: Number(getValue('edit-age')) || 0,
            birthDay: getValue('edit-birthday'),
            nic: getValue('edit-nic'),
            contact: getValue('edit-phone'),
            adress: getValue('edit-address'),
            email: getValue('edit-email'),
            role: 'Employee',
          };
          const token = localStorage.getItem('authToken');
          await axios.put(`http://localhost:5000/api/personnel/update-employee/${selectedEmployee.id}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setSuccessMessage('Employee updated successfully!');
          setIsEditModalOpen(false);
          // Refresh employee list
          const response = await axios.get('http://localhost:5000/api/personnel/all-employees', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const apiEmployees = response.data.data;
          const mappedEmployees: Employee[] = apiEmployees.map((emp: any) => ({
            id: emp._id,
            firstName: emp.fullName?.split(' ')[0] || '',
            lastName: emp.fullName?.split(' ').slice(1).join(' ') || '',
            gender: emp.gender || 'Other',
            age: emp.age || 0,
            birthday: emp.birthDay || '',
            nic: emp.nic || '',
            email: emp.email || '',
            phone: emp.contact || '',
            address: emp.adress || '',
            monthlySalary: emp.monthlySalary || 0,
            totalSalary: emp.totalSalary || 0,
            role: emp.role || '',
            status: emp.status || 'Active',
            joinDate: emp.joinDate || '',
            avatar: emp.avatar || '',
            department: emp.department || '',
          }));
          setEmployees(mappedEmployees);
          setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to update employee');
        } finally {
          setLoading(false);
        }
      }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input type="text" id="edit-firstName" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedEmployee.firstName} required />
              </div>
              <div>
                <label htmlFor="edit-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input type="text" id="edit-lastName" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedEmployee.lastName} required />
              </div>
              <div>
                <label htmlFor="edit-gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select id="edit-gender" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedEmployee.gender} required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-birthday" className="block text-sm font-medium text-gray-700 mb-1">
                  Birthday *
                </label>
                <input type="date" id="edit-birthday" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedEmployee.birthday ? selectedEmployee.birthday.slice(0, 10) : ''} required />
              </div>
              <div>
                <label htmlFor="edit-age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input type="number" id="edit-age" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedEmployee.age} min={0} required />
              </div>
              <div>
                <label htmlFor="edit-nic" className="block text-sm font-medium text-gray-700 mb-1">
                  NIC *
                </label>
                <input type="text" id="edit-nic" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedEmployee.nic} required />
              </div>
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input type="email" id="edit-email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedEmployee.email} required />
              </div>
              <div>
                <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input type="tel" id="edit-phone" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedEmployee.phone} required />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea id="edit-address" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedEmployee.address} required></textarea>
              </div>
              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select id="edit-role" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue="Employee" required>
                  <option value="Employee">Employee</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update Employee
              </Button>
            </div>
          </form>}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Employee">
        {selectedEmployee && <div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    This action cannot be undone. This will permanently delete
                    the employee record and remove all associated data.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              Are you sure you want to delete the employee record for{' '}
              <span className="font-medium">{`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}</span>
              ?
            </p>
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Employee Information
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  <span className="font-medium">Name:</span>{' '}
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </li>
                <li>
                  <span className="font-medium">Role:</span>{' '}
                  {selectedEmployee.role}
                </li>
                <li>
                  <span className="font-medium">Department:</span>{' '}
                  {selectedEmployee.department || 'Unassigned'}
                </li>
                <li>
                  <span className="font-medium">Email:</span>{' '}
                  {selectedEmployee.email}
                </li>
              </ul>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteEmployee}>
                Delete Employee
              </Button>
            </div>
          </div>}
      </Modal>
    </div>;
};
export default EmployeeManager;