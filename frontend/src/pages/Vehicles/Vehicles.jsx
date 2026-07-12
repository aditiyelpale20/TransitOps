import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiSliders, FiFilter } from 'react-icons/fi';
import { vehiclesAPI } from '../../services/api';
import Table from '../../components/Common/Table';
import Badge from '../../components/Common/Badge';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Modal from '../../components/Common/Modal';
import Pagination from '../../components/Common/Pagination';
import SearchBar from '../../components/Common/SearchBar';
import Loader from '../../components/Common/Loader';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Pagination parameters
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehiclesAPI.list({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined
      });
      setVehicles(data);
    } catch (err) {
      console.error("Error loading vehicle registry", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter]);

  const handleOpenAdd = () => {
    setSelectedVehicle(null);
    reset({
      registration_number: '',
      vehicle_name: '',
      vehicle_type: 'Truck',
      max_load_capacity: '',
      odometer: 0,
      acquisition_cost: '',
      status: 'Available'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    reset({
      registration_number: vehicle.registration_number,
      vehicle_name: vehicle.vehicle_name,
      vehicle_type: vehicle.vehicle_type,
      max_load_capacity: vehicle.max_load_capacity,
      odometer: vehicle.odometer,
      acquisition_cost: vehicle.acquisition_cost,
      status: vehicle.status
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedVehicle) {
        await vehiclesAPI.update(selectedVehicle.id, data);
      } else {
        await vehiclesAPI.create(data);
      }
      setIsFormOpen(false);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred while saving the vehicle entry.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle from the registry? All linked records will be deleted.")) {
      try {
        await vehiclesAPI.delete(id);
        fetchVehicles();
      } catch (err) {
        alert(err.response?.data?.detail || "Error deleting vehicle.");
      }
    }
  };

  // Pagination Slice
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = vehicles.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-brand-border/40 pb-5 gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-title uppercase tracking-wide">
            Vehicle Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
            Manage your fleet units, capacities, acquisition costs, and maintenance states.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleOpenAdd}
          className="text-xs font-black uppercase tracking-wider"
          icon={FiPlus}
        >
          Add Vehicle
        </Button>
      </div>

      {/* Search & Filters Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-xl border border-brand-border">
        <div className="md:col-span-2">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by registration plate, make, or model..."
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={["Truck", "Semi", "Box Truck", "Van"]}
          placeholder="All Vehicle Types"
          icon={FiFilter}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={["Available", "On Trip", "In Shop", "Retired"]}
          placeholder="All Statuses"
          icon={FiSliders}
        />
      </div>

      {/* Main Table view */}
      {loading ? (
        <Loader message="Loading vehicle registry database..." />
      ) : (
        <div className="space-y-4">
          <Table 
            headers={["Registration No", "Name / Model", "Type", "Max Capacity", "Odometer", "Acq. Cost", "Status", "Actions"]}
            emptyMessage="No matching vehicle fleet units found."
          >
            {currentItems.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="px-5 py-4 font-bold text-xs text-brand-accent tracking-wide uppercase">
                  {vehicle.registration_number}
                </td>
                <td className="px-5 py-4 text-xs font-black text-slate-200 uppercase">
                  {vehicle.vehicle_name}
                </td>
                <td className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {vehicle.vehicle_type}
                </td>
                <td className="px-5 py-4 text-xs text-slate-300">
                  {vehicle.max_load_capacity.toLocaleString()} kg
                </td>
                <td className="px-5 py-4 text-xs text-slate-300 font-medium">
                  {vehicle.odometer.toLocaleString()} km
                </td>
                <td className="px-5 py-4 text-xs text-slate-300">
                  ₹{vehicle.acquisition_cost.toLocaleString()}
                </td>
                <td className="px-5 py-4">
                  <Badge status={vehicle.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(vehicle)}
                      className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-brand-title hover:bg-slate-700 transition-colors"
                      title="Edit Fleet Info"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-1.5 rounded bg-red-950/20 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                      title="Deregister Unit"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>

          {/* Table Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={vehicles.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedVehicle ? "Modify Fleet Unit Entry" : "Register New Fleet Unit"}
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            label="Registration plate No"
            placeholder="MH-12-GQ-4521"
            error={errors.registration_number}
            required
            {...register('registration_number', { required: 'Registration plate is required.' })}
          />

          <Input
            label="Vehicle Model Name"
            placeholder="Tata Prima 5530.S"
            error={errors.vehicle_name}
            required
            {...register('vehicle_name', { required: 'Vehicle model name is required.' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Vehicle Type"
              options={["Truck", "Semi", "Box Truck", "Van"]}
              placeholder=""
              {...register('vehicle_type')}
            />
            <Input
              label="Max Cargo Capacity (kg)"
              placeholder="40000"
              type="number"
              error={errors.max_load_capacity}
              required
              {...register('max_load_capacity', { 
                required: 'Capacity value is required.', 
                valueAsNumber: true,
                min: { value: 1, message: 'Must be greater than 0.' }
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Odometer (km)"
              placeholder="12000"
              type="number"
              error={errors.odometer}
              required
              {...register('odometer', { 
                required: 'Odometer is required.', 
                valueAsNumber: true,
                min: { value: 0, message: 'Must be non-negative.' }
              })}
            />
            <Input
              label="Acquisition Cost (INR)"
              placeholder="3500000"
              type="number"
              error={errors.acquisition_cost}
              required
              {...register('acquisition_cost', { 
                required: 'Acquisition cost is required.', 
                valueAsNumber: true,
                min: { value: 1, message: 'Must be greater than 0.' }
              })}
            />
          </div>

          <Select
            label="Operational Status"
            options={["Available", "On Trip", "In Shop", "Retired"]}
            placeholder=""
            {...register('status')}
          />

          <div className="flex justify-end space-x-3 pt-3 border-t border-brand-border/40">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Vehicles;
