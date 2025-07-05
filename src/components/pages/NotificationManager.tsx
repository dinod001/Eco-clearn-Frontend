import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, TrashIcon, BellIcon, SendIcon, UsersIcon, FilterIcon, EyeIcon, CalendarIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, InfoIcon } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
import axios from 'axios';
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'General' | 'Alert';
  status: 'Scheduled' | 'Sent' | 'Read' | 'Unread';
  sentDate?: string;
  scheduledDate?: string;
  readCount?: number;
  totalRecipients?: number;
}
const NotificationManager = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [editNotification, setEditNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    console.log('Notification token:', token);
    axios.get('http://localhost:5000/api/personnel/getAll-notification', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        const data = res.data;
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.map((item: any) => ({
            id: item._id,
            title: item.title,
            message: item.message,
            type: item.type === 'Alert' ? 'Alert' : 'General',
            status: item.status === 'Unread' ? 'Read' : (item.status === 'Scheduled' ? 'Scheduled' : 'Sent'),
            sentDate: item.createdAt,
            scheduledDate: undefined,
            readCount: undefined,
            totalRecipients: undefined
          }));
          setNotifications(mapped);
        } else {
          setError('Failed to load notifications');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load notifications');
        setLoading(false);
      });
  }, []);
  const columns = [{
    header: 'Title',
    accessor: 'title',
    cell: (value: string, row: Notification) => <div>
          <div className="font-medium text-gray-900 flex items-center">
            {getNotificationIcon(row.type)}
            <span className="ml-2">{value}</span>
          </div>
        </div>
  }, {
    header: 'Message',
    accessor: 'message',
    cell: (value: string) => <div className="text-gray-500 text-sm truncate max-w-xs">
          {value.substring(0, 60)}...
        </div>
  }, {
    header: 'Type',
    accessor: 'type',
    cell: (value: string) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'General' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
          {value}
        </span>
  }, {
    header: 'Status',
    accessor: 'status',
    cell: (value: string, row: Notification) => <div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'Sent' || value === 'Read' ? 'bg-green-100 text-green-800' : value === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
          {value === 'Scheduled' && row.scheduledDate && <div className="text-xs text-gray-500 mt-1 flex items-center">
              <CalendarIcon size={12} className="mr-1" />
              {new Date(row.scheduledDate).toLocaleDateString()}
            </div>}
          {(value === 'Sent' || value === 'Read') && row.readCount !== undefined && row.totalRecipients !== undefined && <div className="text-xs text-gray-500 mt-1">
                Read by {row.readCount}/{row.totalRecipients}
              </div>}
        </div>
  }, {
    header: 'Actions',
    accessor: 'id',
    cell: (_: any, row: Notification) => <div className="flex space-x-2">
      <Button variant="outline" size="sm" icon={<EyeIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedNotification(row);
        setIsViewModalOpen(true);
      }}>
        View
      </Button>
      <Button variant="outline" size="sm" icon={<SendIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setEditNotification(row);
        setIsEditModalOpen(true);
      }}>
        Edit
      </Button>
      <Button variant="danger" size="sm" icon={<TrashIcon size={14} />} onClick={e => {
        e.stopPropagation();
        setSelectedNotification(row);
        setIsDeleteModalOpen(true);
      }}>
        Delete
      </Button>
    </div>
  }];
  const filteredNotifications = notifications.filter(notification => (typeFilter === 'all' || notification.type === typeFilter) && (statusFilter === 'all' || notification.status === statusFilter) && (notification.title.toLowerCase().includes(searchTerm.toLowerCase()) || notification.message.toLowerCase().includes(searchTerm.toLowerCase())));
  function getNotificationIcon(type: string) {
    switch (type) {
      case 'General':
        return <InfoIcon size={16} className="text-blue-500" />;
      case 'Alert':
        return <AlertCircleIcon size={16} className="text-red-500" />;
      default:
        return <BellIcon size={16} className="text-gray-500" />;
    }
  }
  // Delete notification handler
  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;
    const token = localStorage.getItem('authToken');
    try {
      await axios.delete(`http://localhost:5000/api/personnel/delete-notification/${selectedNotification.id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      setNotifications(notifications.filter(n => n.id !== selectedNotification.id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError('Failed to delete notification');
      setIsDeleteModalOpen(false);
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Notification Management
        </h1>
        <Button variant="primary" icon={<PlusIcon size={18} />} onClick={() => setIsAddModalOpen(true)}>
          Create Notification
        </Button>
      </div>
      <Card>
        <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="relative">
            <input type="text" placeholder="Search notifications..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="all">All Types</option>
              <option value="General">General</option>
              <option value="Alert">Alert</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Sent">Sent</option>
              <option value="Read">Read</option>
            </select>
            <Button variant="outline" icon={<FilterIcon size={18} />}>
              More Filters
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading notifications...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <Table columns={columns} data={filteredNotifications} onRowClick={row => {
            setSelectedNotification(row);
            setIsViewModalOpen(true);
          }} />
        )}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {filteredNotifications.length} of {notifications.length}{' '}
            notifications
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
      {/* Create Notification Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Notification" size="lg">
        <form className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Notification Title
            </label>
            <input type="text" id="title" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter notification title" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea id="message" rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter notification message"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Notification Type
              </label>
              <select id="type" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="General">General</option>
                <option value="Alert">Alert</option>
              </select>
            </div>
            <div>
              <label htmlFor="delivery" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery
              </label>
              <select id="delivery" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="send-now">Send Now</option>
                <option value="schedule">Schedule for Later</option>
                <option value="save-draft">Save as Draft</option>
              </select>
            </div>
            <div>
              <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Date (if applicable)
              </label>
              <input type="datetime-local" id="schedule-date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select id="status" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Sent">Sent</option>
              </select>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="send-email" type="checkbox" className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="send-email" className="font-medium text-gray-700">
                  Send as email
                </label>
                <p className="text-gray-500">
                  Also send this notification as an email to recipients
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<SendIcon size={18} />}>
              Create Notification
            </Button>
          </div>
        </form>
      </Modal>
      {/* View Notification Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Notification Details" size="lg">
        {selectedNotification && <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                {getNotificationIcon(selectedNotification.type)}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  {selectedNotification.title}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedNotification.type === 'General' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedNotification.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedNotification.status === 'Sent' || selectedNotification.status === 'Read' ? 'bg-green-100 text-green-800' : selectedNotification.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {selectedNotification.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-line">
                {selectedNotification.message}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Delivery Status
                </p>
                <div className="mt-1">
                  {selectedNotification.status === 'Sent' || selectedNotification.status === 'Read' ? <div>
                      <p className="text-gray-700">
                        Sent on{' '}
                        {new Date(selectedNotification.sentDate).toLocaleDateString()}
                      </p>
                      {selectedNotification.readCount !== undefined && selectedNotification.totalRecipients !== undefined && <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{
                      width: `${selectedNotification.readCount / selectedNotification.totalRecipients * 100}%`
                    }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Read by {selectedNotification.readCount} out of{' '}
                              {selectedNotification.totalRecipients} recipients
                              (
                              {Math.round(selectedNotification.readCount / selectedNotification.totalRecipients * 100)}
                              %)
                            </p>
                          </div>}
                    </div> : selectedNotification.status === 'Scheduled' ? <p className="text-gray-700">
                      Scheduled for{' '}
                      {new Date(selectedNotification.scheduledDate!).toLocaleDateString()}
                    </p> : <p className="text-gray-700">Draft - Not yet sent</p>}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              {selectedNotification.status === 'Draft' && <Button variant="primary" icon={<SendIcon size={18} />}>
                  Send Now
                </Button>}
            </div>
          </div>}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Notification">
        {selectedNotification && <div>
            <p className="text-gray-600">
              Are you sure you want to delete the notification "
              {selectedNotification.title}"?
              {selectedNotification.status === 'Sent' && ' This notification has already been sent to recipients.'}
              {selectedNotification.status === 'Scheduled' && ' This notification is scheduled to be sent.'}
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteNotification}>
                Delete
              </Button>
            </div>
          </div>}
      </Modal>
      {/* Edit Notification Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Notification" size="lg">
        {editNotification && (
          <form className="space-y-4" onSubmit={e => {
            e.preventDefault();
            // TODO: Implement update logic (API call)
            setIsEditModalOpen(false);
          }}>
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                Notification Title
              </label>
              <input type="text" id="edit-title" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={editNotification.title} />
            </div>
            <div>
              <label htmlFor="edit-message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea id="edit-message" rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={editNotification.message}></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Type
                </label>
                <select id="edit-type" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={editNotification.type}>
                  <option value="General">General</option>
                  <option value="Alert">Alert</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select id="edit-status" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" defaultValue={editNotification.status}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Sent">Sent</option>
                  <option value="Read">Read</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<SendIcon size={18} />}>
                Update Notification
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>;
};
export default NotificationManager;