import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TruckIcon, UsersIcon, ClipboardCheckIcon, PackageIcon, BellIcon, CalendarIcon, UserIcon, AlertCircleIcon } from 'lucide-react';
import Table from '../common/Table';
import axios from 'axios';

interface DashboardStats {
  totalPickups: number;
  totalCustomers: number;
  totalEmployees: number;
  totalServices: number;
  pendingPickups: number;
  completedPickups: number;
  totalNotifications: number;
}

interface PickupRequest {
  id: string;
  username: string;
  contact: string;
  location: string;
  date: string;
  status: string;
  service?: string;
}

interface RecentNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPickups: 0,
    totalCustomers: 0,
    totalEmployees: 0,
    totalServices: 0,
    pendingPickups: 0,
    completedPickups: 0,
    totalNotifications: 0
  });

  const [recentPickups, setRecentPickups] = useState<PickupRequest[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Animation variants
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  // Data fetching function
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch pickup requests
      const pickupResponse = await fetch('http://localhost:5000/api/personnel/get-all-request', {
        headers
      });
      const pickupData = await pickupResponse.json();

      // Fetch customers
      const customerResponse = await fetch('http://localhost:5000/api/personnel/getAllCustomers', {
        headers
      });
      const customerData = await customerResponse.json();
      
      // Process customers
      const allCustomers = customerData.users || [];

      // Fetch employees
      const employeeResponse = await axios.get('http://localhost:5000/api/personnel/all-employees', {
        headers
      });

      // Fetch services
      const serviceResponse = await fetch('http://localhost:5000/api/personnel/get-all-services', {
        headers
      });
      if (!serviceResponse.ok) throw new Error('Failed to fetch services');
      const serviceData = await serviceResponse.json();
      
      // Process services - based on ServicesManager implementation
      const allServices = serviceData.data || [];
      
      console.log('Full services response:', serviceData);
      console.log('Services data array:', allServices);
      console.log('Services count:', allServices.length);

      // Fetch notifications
      const notificationResponse = await axios.get('http://localhost:5000/api/personnel/getAll-notification', {
        headers
      });

      // Process pickup requests
      const allPickups = pickupData.success && Array.isArray(pickupData.allPickups) ? pickupData.allPickups : [];
      const pendingPickups = allPickups.filter((p: any) => p.status === 'Pending').length;
      const completedPickups = allPickups.filter((p: any) => p.status === 'Completed').length;

      // Get recent pickups (last 5)
      const recentPickupData: PickupRequest[] = allPickups
        .slice(0, 5)
        .map((req: any) => ({
          id: req._id,
          username: req.userName || 'Unknown',
          contact: req.contact || '',
          location: req.location || 'Not specified',
          date: req.date ? new Date(req.date).toLocaleDateString() : '',
          status: req.status || 'Pending',
          service: req.serviceType || 'General Waste'
        }));

      // Process notifications
      const allNotifications = notificationResponse.data?.notifications || [];
      const recentNotificationData: RecentNotification[] = allNotifications
        .slice(0, 4)
        .map((notif: any) => ({
          id: notif._id,
          title: notif.title || 'Notification',
          message: notif.message || '',
          type: notif.type || 'info',
          createdAt: notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ''
        }));

      // Update stats
      setStats({
        totalPickups: allPickups.length,
        totalCustomers: allCustomers.length,
        totalEmployees: employeeResponse.data?.data?.length || 0,
        totalServices: Array.isArray(allServices) ? allServices.length : 0,
        pendingPickups,
        completedPickups,
        totalNotifications: allNotifications.length
      });

      setRecentPickups(recentPickupData);
      setRecentNotifications(recentNotificationData);

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  // Table columns for pickup requests
  const pickupColumns = [{
    header: 'Customer',
    accessor: 'username',
    cell: (value: string) => (
      <div className="flex items-center">
        <UserIcon size={16} className="mr-2 text-gray-400" />
        <span className="font-medium">{value}</span>
      </div>
    )
  }, {
    header: 'Location',
    accessor: 'location'
  }, {
    header: 'Service Type',
    accessor: 'service'
  }, {
    header: 'Date',
    accessor: 'date'
  }, {
    header: 'Status',
    accessor: 'status',
    cell: (value: string) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'Completed' ? 'bg-green-100 text-green-800' : value === 'Pending' ? 'bg-yellow-100 text-yellow-800' : value === 'Accepted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
          {value}
        </span>
  }];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-center h-96 bg-white rounded-2xl shadow-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Loading dashboard...</p>
              <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-center h-96 bg-white rounded-2xl shadow-lg">
            <div className="text-center">
              <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircleIcon size={32} className="text-red-500" />
              </div>
              <p className="text-red-600 text-lg font-medium">{error}</p>
              <p className="text-gray-400 text-sm mt-1">Please try refreshing the page</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Welcome back! Here's what's happening with your business today.
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-xl border border-blue-100">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Today</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Pickups</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPickups}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <p className="text-xs text-gray-500">
                      {stats.completedPickups} completed
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <TruckIcon size={28} className="text-green-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <p className="text-xs text-gray-500">Active users</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-100 to-sky-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <UsersIcon size={28} className="text-blue-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Pending Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingPickups}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    <p className="text-xs text-gray-500">Awaiting action</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <ClipboardCheckIcon size={28} className="text-amber-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Services</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalServices}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                    <p className="text-xs text-gray-500">Available options</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <PackageIcon size={28} className="text-indigo-600" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Pickup Requests */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Recent Pickup Requests</h3>
                    <p className="text-gray-600 text-sm mt-1">Latest customer pickup requests</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <TruckIcon size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="p-8">
                {recentPickups.length > 0 ? (
                  <div className="overflow-hidden">
                    <Table columns={pickupColumns} data={recentPickups} />
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <TruckIcon size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No pickup requests found</p>
                    <p className="text-gray-400 text-sm mt-1">New requests will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Notifications & Quick Stats */}
          <div className="space-y-8">
            {/* Recent Notifications */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Recent Notifications</h3>
                    <p className="text-gray-600 text-sm">Latest system updates</p>
                  </div>
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BellIcon size={20} className="text-indigo-600" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex-shrink-0">
                          <BellIcon size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center mt-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                            <p className="text-xs text-gray-400">{notification.createdAt}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <BellIcon size={20} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No recent notifications</p>
                      <p className="text-gray-400 text-sm mt-1">Notifications will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;