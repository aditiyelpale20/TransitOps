import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiSliders, FiCheck, FiX, FiShield } from 'react-icons/fi';
import { driversAPI } from '../../services/api';
import Table from '../../components/Common/Table';
import Badge from '../../components/Common/Badge';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Modal from '../../components/Common/Modal';
import Pagination from '../../components/Common/Pagination';
import SearchBar from '../../components/Common/SearchBar';
import Loader from '../../components/Common/Loader';
import StatsCard from '../../components/Common/StatsCard';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Pagination parameters
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await driversAPI.list({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined
      });
      setDrivers(data);
    } catch (err) {
      console.error("Error loading driver profiles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter]);

  const handleOpenAdd = () => {
    setSelectedDriver(null);
    reset({
      name: '',
      license_number: '',
      license_category: 'HMV',
      license_expiry: '',
      phone: '',
      safety_score: 100,
      status: 'Available'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setSelectedDriver(driver);
    reset({
      name: driver.name,
      license_number: driver.license_number,
      license_category: driver.license_category,
      license_expiry: driver.license_expiry,
      phone: driver.phone,
      safety_score: driver.safety_score,
      status: driver.status
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedDriver) {
        await driversAPI.update(selectedDriver.id, data);
      } else {
        await driversAPI.create(data);
      }
      setIsFormOpen(false);
      fetchDrivers();
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred while saving the driver profile.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this driver profile?")) {
      try {
        await driversAPI.delete(id);
        fetchDrivers();
      } catch (err) {
        alert(err.response?.data?.detail || "Error deleting driver.");
      }
    }
  };

  // Compute metrics
  const avgSafety = drivers.length > 0 ? Math.round(drivers.reduce((acc, d) => acc + d.safety_score, 0) / drivers.length) : 0;
  const activeCount = drivers.filter(d => d.status === "On Trip").length;

  // Pagination Slice
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = drivers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-brand-border/40 pb-5 gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-title uppercase tracking-wide">
            Driver Profiles
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
            Manage dispatch licenses, safety performance indices, and transit logs.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleOpenAdd}
          className="text-xs font-black uppercase tracking-wider"
          icon={FiPlus}
        >
          Add Driver
        </Button>
      </div>

      {/* Safety Pulse Indicators matching mockups */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Safety Pulse Average"
          value={`${avgSafety}%`}
          statusText="Average safety score this month"
          icon={FiShield}
          iconColor="text-emerald-400 bg-emerald-500/10"
        />
        <StatsCard
          title="License Health"
          value={`${drivers.length} Profiles`}
          statusText="Active licensed logistics operators"
          icon={FiCheck}
          iconColor="text-blue-400 bg-blue-500/10"
        />
        <StatsCard
          title="Active Route Duty"
          value={`${activeCount} Drivers`}
          statusText="Currently on active transit status"
          icon={FiSliders}
          iconColor="text-brand-accent bg-brand-accent/10"
        />
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-xl border border-brand-border">
        <div className="md:col-span-2">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by driver name, phone, or license..."
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={["HMV", "LMV"]}
          placeholder="All Categories"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={["Available", "On Trip", "Off Duty", "Suspended"]}
          placeholder="All Statuses"
        />
      </div>

      {/* Main Table view */}
      {loading ? (
        <Loader message="Loading driver profiles registry..." />
      ) : (
        <div className="space-y-4">
          <Table 
            headers={["Driver Name", "License Number", "Category", "Expiry Date", "Phone Number", "Safety Score", "Status", "Actions"]}
            emptyMessage="No matching driver profiles registered."
          >
            {currentItems.map((driver) => (
              <tr key={driver.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="px-5 py-4 font-black text-xs text-slate-200 uppercase tracking-wide">
                  {driver.name}
                </td>
                <td className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {driver.license_number}
                </td>
                <td className="px-5 py-4 text-xs font-bold text-slate-300">
                  {driver.license_category}
                </td>
                <td className="px-5 py-4 text-xs text-slate-350">
                  {driver.license_expiry}
                </td>
                <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                  {driver.phone}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-300">
                      {driver.safety_score}%
                    </span>
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          driver.safety_score >= 90 ? 'bg-emerald-500' : driver.safety_score >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                        }`} 
                        style={{ width: `${driver.safety_score}%` }} 
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Badge status={driver.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(driver)}
                      className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-brand-title hover:bg-slate-700 transition-colors"
                      title="Edit Profile"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="p-1.5 rounded bg-red-950/20 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                      title="Delete Profile"
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
            totalItems={drivers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedDriver ? "Modify Driver Profile" : "Register New Fleet Driver"}
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            label="Driver Full Name"
            placeholder="Rajesh Kumar"
            error={errors.name}
            required
            {...register('name', { required: 'Driver full name is required.' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="License Number"
              placeholder="DL-994827"
              error={errors.license_number}
              required
              {...register('license_number', { required: 'License number is required.' })}
            />
            <Select
              label="License Category"
              options={["HMV", "LMV"]}
              placeholder=""
              {...register('license_category')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="License Expiration Date"
              type="date"
              error={errors.license_expiry}
              required
              {...register('license_expiry', { required: 'Expiration date is required.' })}
            />
            <Input
              label="Contact Phone Number"
              placeholder="+91-98765-43210"
              error={errors.phone}
              required
              {...register('phone', { required: 'Phone number is required.' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Safety Performance Score (%)"
              placeholder="100"
              type="number"
              error={errors.safety_score}
              required
              {...register('safety_score', { 
                required: 'Safety score is required.', 
                valueAsNumber: true,
                min: { value: 0, message: 'Minimum is 0.' },
                max: { value: 100, message: 'Maximum is 100.' }
              })}
            />
            <Select
              label="Availability Status"
              options={["Available", "On Trip", "Off Duty", "Suspended"]}
              placeholder=""
              {...register('status')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-brand-border/40">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Drivers;
