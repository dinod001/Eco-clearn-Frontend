import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, UserIcon, PhoneIcon, MailIcon, MapPinIcon, CalendarIcon, UserPlusIcon, UserMinusIcon, CakeIcon, KeyIcon, EyeIcon, EyeOffIcon, ShieldIcon } from 'lucide-react';
import axios from 'axios';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
interface StaffMember {
  id: string;
  name: string;
  gender: string;
  age: number;
  birthday: string;
  nic: string;
  phone: string;
  address: string;
  email: string;
  username: string;
  password: string;
  role: string;
  // Optionally add avatar, etc.
}

const StaffManager = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    axios.get('http://localhost:5000/api/personnel/getAllPersonnels', {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    })
      .then(res => {
        console.log('Backend response:', res.data); // Debug: log backend response
        // Map backend fields to frontend fields (for this response shape)
        const mapped = (res.data.users || []).map((person: any) => ({
          id: person._id,
          name: person.fullName,
          gender: person.gender,
          age: person.age,
          birthday: person.birthDay,
          nic: person.nic,
          phone: person.contact,
          address: person.adress,
          email: person.email,
          username: person.userName,
          password: person.password,
          role: person.role,
        }));
        setStaffMembers(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err); // Debug: log error
        setLoading(false);
      });
  }, []);

  // Filter staff members based on search term
  const filteredStaff = staffMembers.filter(staff => {
    const term = searchTerm.toLowerCase();
    return (
      staff.name.toLowerCase().includes(term) ||
      staff.email.toLowerCase().includes(term) ||
      staff.username.toLowerCase().includes(term) ||
      staff.role.toLowerCase().includes(term) ||
      staff.address.toLowerCase().includes(term) ||
      staff.phone.toLowerCase().includes(term) ||
      staff.nic.toLowerCase().includes(term)
    );
  });

  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Personnel Management
        </h1>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search personnel..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ minWidth: 180 }}
          />
          <Button variant="primary" icon={<UserPlusIcon size={18} />} onClick={() => setIsAddModalOpen(true)}>
            Add New Personnel
          </Button>
        </div>
      </div>
      <Card>
        <div className="overflow-x-auto w-full">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm md:text-base">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 md:px-4 py-2 border-b whitespace-nowrap">Name</th>
                <th className="px-2 md:px-4 py-2 border-b whitespace-nowrap">Position</th>
                <th className="px-2 md:px-4 py-2 border-b whitespace-nowrap">Department</th>
                <th className="px-2 md:px-4 py-2 border-b whitespace-nowrap">Email</th>
                <th className="px-2 md:px-4 py-2 border-b whitespace-nowrap">Phone</th>
                <th className="px-2 md:px-4 py-2 border-b whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No personnel found.
                  </td>
                </tr>
              ) : filteredStaff.map(staff => (
                <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-2 md:px-4 py-2 border-b whitespace-nowrap max-w-[160px] truncate">{staff.name}</td>
                  <td className="px-2 md:px-4 py-2 border-b whitespace-nowrap max-w-[120px] truncate">{staff.role}</td>
                  <td className="px-2 md:px-4 py-2 border-b whitespace-nowrap max-w-[160px] truncate">{staff.address}</td>
                  <td className="px-2 md:px-4 py-2 border-b whitespace-nowrap max-w-[180px] truncate">{staff.email}</td>
                  <td className="px-2 md:px-4 py-2 border-b whitespace-nowrap max-w-[120px] truncate">{staff.phone}</td>
                  <td className="px-2 md:px-4 py-2 border-b whitespace-nowrap">
                    <div className="flex flex-col md:flex-row gap-2 md:gap-1">
                      <Button variant="outline" size="sm" icon={<EyeIcon size={14} />} onClick={() => {
                        setSelectedStaff(staff);
                        setIsViewModalOpen(true);
                      }}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" icon={<EditIcon size={14} />} onClick={() => {
        // Always set the backend id for update
        setSelectedStaff(staff);
        setIsEditModalOpen(true);
      }}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" icon={<TrashIcon size={14} />} onClick={() => {
                        setSelectedStaff(staff);
                        setIsDeleteModalOpen(true);
                      }}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {/* View Staff Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Personnel Details" size="lg">
        {selectedStaff && <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                <UserIcon size={32} className="text-gray-500" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-medium text-gray-800">{selectedStaff.name}</h3>
                <p className="text-gray-600">
                  {selectedStaff.role === 'Admin' ? 'Administrator' : 'Staff'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <h4 className="font-medium mb-2 text-gray-700">
                  Personal Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <span className="w-5 h-5 mr-2 flex items-center justify-center text-gray-400">
                      <span className="font-medium">G</span>
                    </span>
                    <span>Gender: {selectedStaff.gender}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="w-5 h-5 mr-2 flex items-center justify-center text-gray-400">
                      <span className="font-medium">A</span>
                    </span>
                    <span>Age: {selectedStaff.age} years</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CakeIcon size={16} className="mr-2 text-gray-400" />
                    <span>
                      Birthday:{' '}
                      {new Date(selectedStaff.birthday).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ShieldIcon size={16} className="mr-2 text-gray-400" />
                    <span>NIC: {selectedStaff.nic}</span>
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
                    <span>{selectedStaff.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon size={16} className="mr-2 text-gray-400" />
                    <span>{selectedStaff.phone}</span>
                  </div>
                  <div className="flex items-start text-gray-600">
                    <MapPinIcon size={16} className="mr-2 mt-1 text-gray-400" />
                    <span>{selectedStaff.address}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-2 text-gray-700">System Access</h4>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <div className="flex items-center mb-2">
                    <KeyIcon size={16} className="mr-1 text-gray-400" />
                    <span className="font-medium text-gray-700">Username:</span>
                    <span className="ml-2">{selectedStaff.username}</span>
                  </div>
                  <div className="flex items-center">
                    <KeyIcon size={16} className="mr-1 text-gray-400" />
                    <span className="font-medium text-gray-700">Password:</span>
                    <span className="ml-2">••••••••</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" icon={<KeyIcon size={14} />}>
                  Reset Password
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
                Edit Personnel
              </Button>
            </div>
          </div>}
      </Modal>
      {/* Add Staff Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Personnel" size="lg">
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const personnelInfo = {
            fullName: formData.get('fullName'),
            gender: formData.get('gender'),
            age: Number(formData.get('age')),
            birthDay: formData.get('birthDay'),
            nic: formData.get('nic'),
            contact: formData.get('contact'),
            adress: formData.get('adress'),
            email: formData.get('email'),
            userName: formData.get('userName'),
            password: formData.get('password'),
            role: formData.get('role'),
          };
          try {
            const token = localStorage.getItem('authToken');
            const res = await axios.post('http://localhost:5000/api/personnel/register', { personnelInfo }, {
              headers: {
                Authorization: token ? `Bearer ${token}` : undefined,
              },
            });
            // Optionally, refresh the staff list after successful add
            setIsAddModalOpen(false);
            // Refetch personnel list
            setLoading(true);
            axios.get('http://localhost:5000/api/personnel/getAllPersonnels', {
              headers: {
                Authorization: token ? `Bearer ${token}` : undefined,
              },
            })
              .then(res => {
                const mapped = (res.data.users || []).map((person: any) => ({
                  id: person._id,
                  name: person.fullName,
                  gender: person.gender,
                  age: person.age,
                  birthday: person.birthDay,
                  nic: person.nic,
                  phone: person.contact,
                  address: person.adress,
                  email: person.email,
                  username: person.userName,
                  password: person.password,
                  role: person.role,
                }));
                setStaffMembers(mapped);
                setLoading(false);
              })
              .catch(() => setLoading(false));
          } catch (err) {
            alert('Failed to add personnel.');
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input type="text" id="fullName" name="fullName" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter full name" />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select id="gender" name="gender" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input type="number" id="age" name="age" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter age" />
            </div>
            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
                Birthday
              </label>
              <input type="date" id="birthday" name="birthDay" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="nic" className="block text-sm font-medium text-gray-700 mb-1">
                NIC
              </label>
              <input type="text" id="nic" name="nic" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter NIC number" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input type="email" id="email" name="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter email address" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input type="tel" id="phone" name="contact" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter phone number" />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input type="text" id="username" name="userName" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter username" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10" placeholder="Enter password" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOffIcon size={18} className="text-gray-400" /> : <EyeIcon size={18} className="text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select id="role" name="role" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea id="address" name="adress" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter address"></textarea>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Personnel
            </Button>
          </div>
        </form>
      </Modal>
      {/* Edit Staff Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Personnel" size="lg">
        {selectedStaff && <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          // Helper to get value or fallback to current
          const getValue = (key: string, fallback: any) => {
            const val = formData.get(key);
            return (val === null || val === undefined || val === '') ? fallback : val;
          };
          // Build the full user data object with backend field names
          const updatingId = selectedStaff.id;
          const fullUserData: any = {
            _id: updatingId, // Backend expects _id
            fullName: getValue('edit-name', selectedStaff.name),
            gender: getValue('edit-gender', selectedStaff.gender),
            age: Number(getValue('edit-age', selectedStaff.age)),
            birthDay: getValue('edit-birthday', selectedStaff.birthday),
            nic: getValue('edit-nic', selectedStaff.nic),
            contact: getValue('edit-phone', selectedStaff.phone),
            adress: getValue('edit-address', selectedStaff.address),
            email: getValue('edit-email', selectedStaff.email),
            userName: getValue('edit-username', selectedStaff.username),
            role: getValue('edit-role', selectedStaff.role),
          };
          // Only add password if user entered a new one (future-proof, but not used now)
          const newPassword = formData.get('edit-password');
          if (newPassword && typeof newPassword === 'string' && newPassword.trim() !== '') {
            fullUserData.password = newPassword;
          }
          console.log('PATCH payload:', fullUserData); // Debug: log payload
          setLoading(true);
          try {
            const token = localStorage.getItem('authToken');
            await axios.patch(`http://localhost:5000/api/personnel/UpdatePersonnel/${updatingId}`,
              { updateData: fullUserData }, // wrap in updateData for backend compatibility
              {
                headers: {
                  Authorization: token ? `Bearer ${token}` : undefined,
                },
              }
            );
            setIsEditModalOpen(false);
            // Refetch personnel list
            axios.get('http://localhost:5000/api/personnel/getAllPersonnels', {
              headers: {
                Authorization: token ? `Bearer ${token}` : undefined,
              },
            })
              .then(res => {
                const mapped = (res.data.users || []).map((person: any) => ({
                  id: person._id,
                  name: person.fullName,
                  gender: person.gender,
                  age: person.age,
                  birthday: person.birthDay,
                  nic: person.nic,
                  phone: person.contact,
                  address: person.adress,
                  email: person.email,
                  username: person.userName,
                  password: person.password,
                  role: person.role,
                }));
                setStaffMembers(mapped);
                setLoading(false);
              })
              .catch(() => setLoading(false));
          } catch (err: any) {
            setLoading(false);
            console.error('Update error:', err?.response?.data || err);
            alert('Failed to update personnel. ' + (err?.response?.data?.message || ''));
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input type="text" id="edit-name" name="edit-name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedStaff.name} />
            </div>
            <div>
              <label htmlFor="edit-gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select id="edit-gender" name="edit-gender" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedStaff.gender}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="edit-age" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input type="number" id="edit-age" name="edit-age" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedStaff.age} />
            </div>
            <div>
              <label htmlFor="edit-birthday" className="block text-sm font-medium text-gray-700 mb-1">
                Birthday
              </label>
              <input type="date" id="edit-birthday" name="edit-birthday" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedStaff.birthday} />
            </div>
            <div>
              <label htmlFor="edit-nic" className="block text-sm font-medium text-gray-700 mb-1">
                NIC
              </label>
              <input type="text" id="edit-nic" name="edit-nic" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedStaff.nic} />
            </div>
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input type="email" id="edit-email" name="edit-email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedStaff.email} />
            </div>
            <div>
              <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input type="tel" id="edit-phone" name="edit-phone" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedStaff.phone} />
            </div>
            <div>
              <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input type="text" id="edit-username" name="edit-username" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedStaff.username} />
            </div>
            <div>
              <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select id="edit-role" name="edit-role" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedStaff.role}>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea id="edit-address" name="edit-address" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={selectedStaff.address}></textarea>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Personnel
            </Button>
          </div>
        </form>}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Personnel">
        {selectedStaff && <div>
            <p className="text-gray-600">
              Are you sure you want to delete the personnel record for{' '}
              <span className="font-medium">{selectedStaff.name}</span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={async () => {
                if (!selectedStaff) return;
                setLoading(true);
                try {
                  const token = localStorage.getItem('authToken');
                  await axios.delete(`http://localhost:5000/api/personnel/deletePersonnel/${selectedStaff.id}`, {
                    headers: {
                      Authorization: token ? `Bearer ${token}` : undefined,
                    },
                  });
                  setIsDeleteModalOpen(false);
                  // Refetch personnel list
                  axios.get('http://localhost:5000/api/personnel/getAllPersonnels', {
                    headers: {
                      Authorization: token ? `Bearer ${token}` : undefined,
                    },
                  })
                    .then(res => {
                      const mapped = (res.data.users || []).map((person: any) => ({
                        id: person._id,
                        name: person.fullName,
                        gender: person.gender,
                        age: person.age,
                        birthday: person.birthDay,
                        nic: person.nic,
                        phone: person.contact,
                        address: person.adress,
                        email: person.email,
                        username: person.userName,
                        password: person.password,
                        role: person.role,
                      }));
                      setStaffMembers(mapped);
                      setLoading(false);
                    })
                    .catch(() => setLoading(false));
                } catch (err) {
                  setLoading(false);
                  alert('Failed to delete personnel.');
                }
              }}>
                Delete
              </Button>
            </div>
          </div>}
      </Modal>
    </div>;
};
export default StaffManager;