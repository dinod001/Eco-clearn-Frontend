import React, { useState, useEffect } from 'react';
import { PlusIcon, EditIcon, TrashIcon, PackageIcon, DollarSignIcon, PercentIcon, ImageIcon, ToggleLeftIcon, ToggleRightIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import Modal from '../common/Modal';

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
    }, 6000); // Increased to 6 seconds

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
      
      {/* Progress bar */}
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
interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  imageURL: string;
  availability: boolean;
}
const ServicesManager = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast helper functions
  const addToast = (type: ToastType, title: string, message: string) => {
    const newToast: Toast = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
    };
    console.log('Adding toast:', newToast); // Debug log
    setToasts(prev => {
      const updated = [...prev, newToast];
      console.log('Updated toasts array:', updated); // Debug log
      return updated;
    });
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:5000/api/personnel/get-all-services', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      console.log('Fetched services data:', data); // Debug log
      const mapped = (data.data || []).map((svc: any) => ({
        id: svc._id,
        name: svc.serviceName,
        description: svc.description,
        price: svc.price,
        discount: svc.discount,
        imageURL: svc.imageUrl,
        availability: svc.Availability === true,
      }));
      setServices(mapped);
    } catch (err) {
      setServices([]);
      addToast('error', 'Failed to Load Services', 'Unable to fetch services from the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);
  const filteredServices = services.filter(service =>
    availabilityFilter === 'all' ||
    (availabilityFilter === 'available' && service.availability) ||
    (availabilityFilter === 'unavailable' && !service.availability)
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Debug Info - Remove in production */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 rounded text-xs z-[9999]">
          Active toasts: {toasts.length}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
                <PackageIcon size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Services Management
                </h1>
                <p className="text-gray-500 mt-1">Manage your service offerings and pricing</p>
              </div>
            </div>
            <Button 
              variant="primary" 
              icon={<PlusIcon size={18} />} 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Add New Service
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <PackageIcon size={24} className="text-blue-600" />
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Available</p>
                <p className="text-2xl font-bold text-green-600">{services.filter(s => s.availability).length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <ToggleRightIcon size={24} className="text-green-600" />
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Unavailable</p>
                <p className="text-2xl font-bold text-red-600">{services.filter(s => !s.availability).length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <ToggleLeftIcon size={24} className="text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Filter Services</h3>
              <p className="text-sm text-gray-500">Choose the availability status to filter services</p>
            </div>
            <div className="flex space-x-3">
              <select 
                value={availabilityFilter} 
                onChange={e => setAvailabilityFilter(e.target.value)} 
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:border-gray-300 transition-colors duration-200"
              >
                <option value="all">All Services</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>
          </div>
        </div>
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                  <div className="flex space-x-3">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {filteredServices.map(service => 
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onEdit={() => {
                    setSelectedService(service);
                    setIsEditModalOpen(true);
                  }} 
                  onDelete={() => {
                    setSelectedService(service);
                    setIsDeleteModalOpen(true);
                  }} 
                />
              )}
              {filteredServices.length === 0 && (
                <div className="col-span-3 py-16 text-center">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
                    <PackageIcon size={64} className="mx-auto mb-6 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No services found
                    </h3>
                    <p className="text-gray-500">
                      No services match your current filter criteria. Try adjusting your filters or add a new service.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add New Service Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => {
        setIsAddModalOpen(false);
        setAddImageFile(null);
      }} title="Add New Service" size="lg">
        <div className="mb-6">
          <p className="text-gray-600">Create a new service offering for your customers with detailed information and pricing.</p>
        </div>
        <form className="space-y-6" onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const serviceData = {
            serviceName: formData.get('name'),
            description: formData.get('description'),
            price: Number(formData.get('price')),
            discount: Number(formData.get('discount')),
            Availability: formData.get('availability') === 'on',
          };
          const imageFile = addImageFile;
          if (!imageFile) {
            addToast('warning', 'Image Required', 'Please select an image for the service.');
            return;
          }
          const payload = new FormData();
          payload.append('serviceData', JSON.stringify(serviceData));
          payload.append('image', imageFile);
          try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/personnel/add-new-service', {
              method: 'POST',
              headers: {
                Authorization: token ? `Bearer ${token}` : '',
              },
              body: payload,
            });
            if (!res.ok) throw new Error('Failed to add service');
            addToast('success', 'Service Created!', `"${serviceData.serviceName}" has been successfully added to your services.`);
            setIsAddModalOpen(false);
            setAddImageFile(null);
            fetchServices(); // Refresh the services list
          } catch (err) {
            addToast('error', 'Failed to Create Service', 'There was an error creating the service. Please try again.');
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Service Name
              </label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                placeholder="Enter a compelling service name" 
                required 
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea 
                id="description" 
                name="description" 
                rows={4} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none" 
                placeholder="Describe what makes this service special..." 
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                Price (LKR)
              </label>
              <div className="relative">
                <DollarSignIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="number" 
                  id="price" 
                  name="price" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                  placeholder="0.00" 
                  required 
                />
              </div>
            </div>
            <div>
              <label htmlFor="discount" className="block text-sm font-semibold text-gray-700 mb-2">
                Discount (%)
              </label>
              <div className="relative">
                <PercentIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="number" 
                  id="discount" 
                  name="discount" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                  placeholder="0" 
                  min="0" 
                  max="100" 
                  required 
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-2">
                Service Image
              </label>
              <div className="relative">
                <input 
                  type="file" 
                  id="image" 
                  name="image" 
                  accept="image/*" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  required 
                  onChange={e => setAddImageFile(e.target.files ? e.target.files[0] : null)} 
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-200">
                <input 
                  id="availability" 
                  name="availability" 
                  type="checkbox" 
                  className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                />
                <label htmlFor="availability" className="ml-3 block text-sm font-medium text-green-800">
                  Service is available for customers
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddModalOpen(false);
                setAddImageFile(null);
              }}
              className="px-6 py-3 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Create Service
            </Button>
          </div>
        </form>
      </Modal>
      {/* Edit Service Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Service" size="lg">
        {selectedService && (
          <EditServiceForm
            service={selectedService}
            onClose={() => setIsEditModalOpen(false)}
            onUpdated={async () => {
              // Refresh the services list after update
              fetchServices();
              addToast('success', 'Service Updated!', 'The service has been successfully updated.');
            }}
            addToast={addToast}
          />
        )}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Service">
        {selectedService && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <TrashIcon size={32} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Are you sure you want to delete this service?
            </h3>
            <p className="text-gray-600 mb-1">
              You're about to delete <strong>"{selectedService.name}"</strong>
            </p>
            <p className="text-sm text-gray-500 mb-8">
              This action cannot be undone and may affect existing service requests.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-3 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={async () => {
                  if (!selectedService) return;
                  try {
                    const token = localStorage.getItem('authToken');
                    const res = await fetch(`http://localhost:5000/api/personnel/delete-service/${selectedService.id}`, {
                      method: 'DELETE',
                      headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                      },
                    });
                    if (!res.ok) throw new Error('Failed to delete service');
                    setIsDeleteModalOpen(false);
                    addToast('success', 'Service Deleted!', `"${selectedService.name}" has been successfully removed from your services.`);
                    fetchServices(); // Refresh the services list
                  } catch (err) {
                    addToast('error', 'Failed to Delete Service', 'There was an error deleting the service. Please try again.');
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Delete Service
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
}
const ServiceCard = ({
  service,
  onEdit,
  onDelete
}: ServiceCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }} 
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
    >
      {/* Image Section */}
      <div className="h-48 overflow-hidden relative">
        {service.imageURL ? (
          <img 
            src={service.imageURL} 
            alt={service.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <ImageIcon size={64} className="text-gray-400" />
          </div>
        )}
        {/* Availability Badge */}
        <div className="absolute top-4 right-4">
          {service.availability ? (
            <span className="flex items-center px-3 py-1.5 text-xs font-semibold text-green-800 bg-green-100 backdrop-blur-sm rounded-full border border-green-200">
              <ToggleRightIcon size={14} className="mr-1 text-green-600" />
              Available
            </span>
          ) : (
            <span className="flex items-center px-3 py-1.5 text-xs font-semibold text-red-800 bg-red-100 backdrop-blur-sm rounded-full border border-red-200">
              <ToggleLeftIcon size={14} className="mr-1 text-red-600" />
              Unavailable
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200 truncate">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>{service.description}</p>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center text-gray-800">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <DollarSignIcon size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Price</p>
              <span className="text-lg font-bold text-gray-900">
                LKR {service.price.toLocaleString()}
              </span>
            </div>
          </div>
          {service.discount > 0 && (
            <div className="text-right">
              <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white flex items-center shadow-md">
                <PercentIcon size={12} className="mr-1" />
                {service.discount}% OFF
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Save LKR {Math.round((service.price * service.discount) / 100).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            icon={<EditIcon size={16} />} 
            onClick={onEdit}
            className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
          >
            Edit
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            icon={<TrashIcon size={16} />} 
            onClick={onDelete}
            className="flex-1 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
          >
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
const EditServiceForm = ({ service, onClose, onUpdated, addToast }: { service: Service, onClose: () => void, onUpdated: () => void, addToast: (type: ToastType, title: string, message: string) => void }) => {
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [price, setPrice] = useState(service.price);
  const [discount, setDiscount] = useState(service.discount);
  const [availability, setAvailability] = useState(service.availability);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRemoveImage = () => setImageFile(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const updateData = {
      serviceName: name,
      description,
      price: Number(price),
      discount: Number(discount),
      Availability: availability,
    };
    const payload = new FormData();
    payload.append('updateData', JSON.stringify(updateData));
    if (imageFile) payload.append('image', imageFile);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:5000/api/personnel/update-service/${service.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: payload,
      });
      if (!res.ok) throw new Error('Failed to update service');
      onClose();
      onUpdated();
    } catch (err) {
      addToast('error', 'Failed to Update Service', 'There was an error updating the service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600">Update the service information below. Changes will be reflected immediately.</p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="edit-name" className="block text-sm font-semibold text-gray-700 mb-2">
              Service Name
            </label>
            <input 
              type="text" 
              id="edit-name" 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="edit-description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea 
              id="edit-description" 
              rows={4} 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="edit-price" className="block text-sm font-semibold text-gray-700 mb-2">
              Price (LKR)
            </label>
            <div className="relative">
              <DollarSignIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="number" 
                id="edit-price" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                value={price} 
                onChange={e => setPrice(Number(e.target.value))} 
                required 
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-discount" className="block text-sm font-semibold text-gray-700 mb-2">
              Discount (%)
            </label>
            <div className="relative">
              <PercentIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="number" 
                id="edit-discount" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                value={discount} 
                onChange={e => setDiscount(Number(e.target.value))} 
                min="0" 
                max="100" 
                required 
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="edit-image" className="block text-sm font-semibold text-gray-700 mb-2">
              Service Image
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {service.imageURL && !imageFile && (
                  <div className="relative">
                    <img src={service.imageURL} alt="Current" className="h-20 w-20 object-cover rounded-xl border-2 border-gray-200" />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <ImageIcon size={12} />
                    </div>
                  </div>
                )}
                {imageFile && (
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img src={URL.createObjectURL(imageFile)} alt="New" className="h-20 w-20 object-cover rounded-xl border-2 border-blue-200" />
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                        <ImageIcon size={12} />
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRemoveImage}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                id="edit-image" 
                accept="image/*" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} 
              />
              <p className="text-xs text-gray-500">Leave blank to keep the current image.</p>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-200">
              <input 
                id="edit-availability" 
                type="checkbox" 
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                checked={availability} 
                onChange={e => setAvailability(e.target.checked)} 
              />
              <label htmlFor="edit-availability" className="ml-3 block text-sm font-medium text-green-800">
                Service is available for customers
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-6 py-3 hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? 'Updating...' : 'Update Service'}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default ServicesManager;