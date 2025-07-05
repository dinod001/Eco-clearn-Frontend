import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, PackageIcon, ChevronRightIcon, DollarSignIcon, PercentIcon, ImageIcon, ToggleLeftIcon, ToggleRightIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
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
  useEffect(() => {
    const fetchServices = async () => {
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
      }
    };
    fetchServices();
  }, []);
  const filteredServices = services.filter(service =>
    availabilityFilter === 'all' ||
    (availabilityFilter === 'available' && service.availability) ||
    (availabilityFilter === 'unavailable' && !service.availability)
  );
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Services Management
        </h1>
        <Button variant="primary" icon={<PlusIcon size={18} />} onClick={() => setIsAddModalOpen(true)}>
          Add New Service
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex space-x-2">
          <select value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="all">All Services</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => <ServiceCard key={service.id} service={service} onEdit={() => {
        setSelectedService(service);
        setIsEditModalOpen(true);
      }} onDelete={() => {
        setSelectedService(service);
        setIsDeleteModalOpen(true);
      }} />)}
        {filteredServices.length === 0 && <div className="col-span-3 py-10 text-center text-gray-500">
            <PackageIcon size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">
              No services found matching your criteria.
            </p>
          </div>}
      </div>
      {/* Add New Service Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Service" size="lg">
        <form className="space-y-4" onSubmit={async (e) => {
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
            alert('Please select an image.');
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
            alert('Service added successfully!');
            setIsAddModalOpen(false);
            // Optionally refresh services list here
          } catch (err) {
            alert('Failed to add service.');
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Service Name
              </label>
              <input type="text" id="name" name="name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter service name" required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea id="description" name="description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter service description" required></textarea>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (LKR)
              </label>
              <input type="number" id="price" name="price" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter price" required />
            </div>
            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input type="number" id="discount" name="discount" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter discount percentage" min="0" max="100" required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <input type="file" id="image" name="image" accept="image/*" className="w-full" required onChange={e => setAddImageFile(e.target.files ? e.target.files[0] : null)} />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input id="availability" name="availability" type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                <label htmlFor="availability" className="ml-2 block text-sm text-gray-700">
                  Service is available
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
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
              try {
                const token = localStorage.getItem('authToken');
                const refreshed = await fetch('http://localhost:5000/api/personnel/get-all-services', {
                  headers: { Authorization: token ? `Bearer ${token}` : '' },
                });
                const data = await refreshed.json();
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
                // Optionally handle error
              }
            }}
          />
        )}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Service">
        {selectedService && <div>
            <p className="text-gray-600">
              Are you sure you want to delete the service "
              {selectedService.name}"? This action cannot be undone and may
              affect existing service requests.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={async () => {
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
            // Refresh the services list
            const refreshed = await fetch('http://localhost:5000/api/personnel/get-all-services', {
              headers: { Authorization: token ? `Bearer ${token}` : '' },
            });
            const data = await refreshed.json();
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
            alert('Failed to delete service.');
          }
        }}>
                Delete
              </Button>
            </div>
          </div>}
      </Modal>
    </div>;
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
  return <motion.div whileHover={{
    y: -5
  }} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-40 overflow-hidden">
        {service.imageURL ? <img src={service.imageURL} alt={service.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ImageIcon size={48} className="text-gray-300" />
          </div>}
      </div>
      <div className={`px-6 py-4 border-b ${service.availability ? 'bg-green-50' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-800">{service.name}</h3>
          {service.availability ? <span className="flex items-center text-xs font-medium text-green-800">
              <ToggleRightIcon size={16} className="mr-1 text-green-600" />
              Available
            </span> : <span className="flex items-center text-xs font-medium text-gray-800">
              <ToggleLeftIcon size={16} className="mr-1 text-gray-600" />
              Unavailable
            </span>}
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-600 mb-4">{service.description}</p>
        <div className="flex items-center mb-3 text-gray-700">
          <DollarSignIcon size={16} className="mr-2 text-gray-400" />
          <span className="font-medium">
            LKR {service.price.toLocaleString()}
          </span>
          {service.discount > 0 && <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center">
              <PercentIcon size={12} className="mr-1" />
              {service.discount}% off
            </span>}
        </div>
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-100">
          <Button variant="outline" size="sm" icon={<EditIcon size={14} />} onClick={onEdit}>
            Edit
          </Button>
          <Button variant="danger" size="sm" icon={<TrashIcon size={14} />} onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </motion.div>;
};
const EditServiceForm = ({ service, onClose, onUpdated }: { service: Service, onClose: () => void, onUpdated: () => void }) => {
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
      alert('Service updated successfully!');
      onClose();
      onUpdated();
    } catch (err) {
      alert('Failed to update service.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
            Service Name
          </label>
          <input type="text" id="edit-name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea id="edit-description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
        </div>
        <div>
          <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">
            Price (LKR)
          </label>
          <input type="number" id="edit-price" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={price} onChange={e => setPrice(Number(e.target.value))} required />
        </div>
        <div>
          <label htmlFor="edit-discount" className="block text-sm font-medium text-gray-700 mb-1">
            Discount (%)
          </label>
          <input type="number" id="edit-discount" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" value={discount} onChange={e => setDiscount(Number(e.target.value))} min="0" max="100" required />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700 mb-1">
            Image (leave blank to keep current)
          </label>
          <div className="flex items-center space-x-4">
            {service.imageURL && !imageFile && (
              <img src={service.imageURL} alt="Current" className="h-16 w-16 object-cover rounded border" />
            )}
            {imageFile && (
              <div className="flex items-center space-x-2">
                <img src={URL.createObjectURL(imageFile)} alt="New" className="h-16 w-16 object-cover rounded border" />
                <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage}>Remove</Button>
              </div>
            )}
            <input type="file" id="edit-image" accept="image/*" className="w-full" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Leave blank to keep the current image.</p>
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center">
            <input id="edit-availability" type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" checked={availability} onChange={e => setAvailability(e.target.checked)} />
            <label htmlFor="edit-availability" className="ml-2 block text-sm text-gray-700">
              Service is available
            </label>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Service'}
        </Button>
      </div>
    </form>
  );
};
export default ServicesManager;