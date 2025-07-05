import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { TruckIcon, UsersIcon, ClipboardCheckIcon, PackageIcon, BellIcon, ArrowUpIcon, ArrowDownIcon, CalendarIcon, MapPinIcon } from 'lucide-react';
import Card from '../common/Card';
import StatCard from '../common/StatCard';
import Table from '../common/Table';
const Dashboard = () => {
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
  // Sample data
  const recentPickups = [{
    id: 1,
    customer: 'Perera Enterprises',
    location: 'Colombo 05',
    service: 'Plastic Recycling',
    date: '2023-09-25',
    status: 'Completed'
  }, {
    id: 2,
    customer: 'Green Solutions Ltd',
    location: 'Kandy',
    service: 'E-waste Collection',
    date: '2023-09-24',
    status: 'Pending'
  }, {
    id: 3,
    customer: 'Lakeside Hotel',
    location: 'Negombo',
    service: 'General Waste',
    date: '2023-09-23',
    status: 'Accepted'
  }, {
    id: 4,
    customer: 'Tech Park',
    location: 'Malabe',
    service: 'Paper Recycling',
    date: '2023-09-22',
    status: 'Completed'
  }];
  const pickupColumns = [{
    header: 'Customer',
    accessor: 'customer'
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
    cell: (value: string) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'Completed' ? 'bg-green-100 text-green-800' : value === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
          {value}
        </span>
  }];
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CalendarIcon size={16} />
          <span>
            {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          </span>
        </div>
      </div>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div variants={itemVariants}>
          <StatCard title="Total Pickups" value="1,284" icon={<TruckIcon size={24} />} change={12.5} colorClass="bg-green-50 text-green-700" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Active Customers" value="847" icon={<UsersIcon size={24} />} change={8.2} colorClass="bg-blue-50 text-blue-700" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Service Requests" value="56" icon={<ClipboardCheckIcon size={24} />} change={-3.6} colorClass="bg-amber-50 text-amber-700" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Total Services" value="12" icon={<PackageIcon size={24} />} change={0} colorClass="bg-indigo-50 text-indigo-700" />
        </motion.div>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Recent Pickup Requests">
            <Table columns={pickupColumns} data={recentPickups} />
          </Card>
        </div>
        <div>
          <Card title="Notifications" icon={<BellIcon size={18} />}>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <TruckIcon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">New pickup request</p>
                  <p className="text-xs text-gray-500">
                    Perera Enterprises - Colombo 05
                  </p>
                  <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <UsersIcon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">New customer registered</p>
                  <p className="text-xs text-gray-500">Green Solutions Ltd</p>
                  <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                  <ClipboardCheckIcon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Service request completed
                  </p>
                  <p className="text-xs text-gray-500">
                    Lakeside Hotel - General Waste
                  </p>
                  <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-red-100 text-red-600">
                  <MapPinIcon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">Pickup location changed</p>
                  <p className="text-xs text-gray-500">
                    Tech Park - New location: Malabe
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>;
};
export default Dashboard;