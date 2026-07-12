import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiSliders, FiCompass, FiCheck, FiXCircle } from 'react-icons/fi';
import { tripsAPI, vehiclesAPI, driversAPI } from '../../services/api';
import Table from '../../components/Common/Table';
import Badge from '../../components/Common/Badge';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Modal from '../../components/Common/Modal';
import Pagination from '../../components/Common/Pagination';
import SearchBar from '../../components/Common/SearchBar';
import Loader from '../../components/Common/Loader';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Searching parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination parameters
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  
  // Watch vehicle selection to validate max weight capacity dynamically
  const watchedVehicleId = watch('vehicle_id');

  const fetchTripsData = async () => {
    setLoading(true);
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        tripsAPI.list({
          search: searchQuery || undefined,
          status: statusFilter || undefined
        }),
        vehiclesAPI.list({ status: 'Available' }), // Available vehicles only
        driversAPI.list({ status: 'Available' })  // Available drivers only
      ]);
      setTrips(tripsRes);
      setVehicles(vehiclesRes);
      setDrivers(driversRes);
    } catch (err) {
      console.error("Error loading trips log", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsData();
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleOpenAdd = () => {
    setSelectedTrip(null);
    reset({
      vehicle_id: '',
      driver_id: '',
      source: '',
      destination: '',
      cargo_weight: '',
      planned_distance: '',
      actual_distance: 0,
      fuel_consumed: 0,
      status: 'Pending'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (trip) => {
    setSelectedTrip(trip);
    // Add current trip's vehicle/driver into dropdown option list temporarily if not available
    const hasVeh = vehicles.some(v => v.id === trip.vehicle_id);
    if (!hasVeh && trip.vehicle) {
      setVehicles(prev => [...prev, trip.vehicle]);
    }
    const hasDrv = drivers.some(d => d.id === trip.driver_id);
    if (!hasDrv && trip.driver) {
      setDrivers(prev => [...prev, trip.driver]);
    }

    reset({
      vehicle_id: trip.vehicle_id,
      driver_id: trip.driver_id,
      source: trip.source,
      destination: trip.destination,
      cargo_weight: trip.cargo_weight,
      planned_distance: trip.planned_distance,
      actual_distance: trip.actual_distance,
      fuel_consumed: trip.fuel_consumed,
      status: trip.status
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedTrip) {
        await tripsAPI.update(selectedTrip.id, data);
      } else {
        await tripsAPI.create(data);
      }
      setIsFormOpen(false);
      fetchTripsData();
    } catch (err) {
      alert(err.response?.data?.detail || "Error dispatching trip.");
    }
  };

  const handleCompleteTrip = async (trip) => {
    const actDist = prompt("Enter final actual odometer distance traveled (km):", trip.planned_distance);
    if (actDist === null) return;
    const fuel = prompt("Enter total liters of fuel consumed:", Math.round(Number(actDist) / 4));
    if (fuel === null) return;

    try {
      await tripsAPI.update(trip.id, {
        status: 'Completed',
        actual_distance: Number(actDist),
        fuel_consumed: Number(fuel)
      });
      fetchTripsData();
    } catch (err) {
      alert(err.response?.data?.detail || "Error completing trip.");
    }
  };

  const handleCancelTrip = async (id) => {
    if (window.confirm("Are you sure you want to cancel this dispatched route booking?")) {
      try {
        await tripsAPI.update(id, { status: 'Cancelled' });
        fetchTripsData();
      } catch (err) {
        alert(err.response?.data?.detail || "Error canceling trip.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this trip log?")) {
      try {
        await tripsAPI.delete(id);
        fetchTripsData();
      } catch (err) {
        alert(err.response?.data?.detail || "Error deleting trip.");
      }
    }
  };

  // Find max capacity of current vehicle selected
  const activeVehicleObj = vehicles.find(v => v.id === Number(watchedVehicleId));
  const capacityMessage = activeVehicleObj 
    ? `Selected vehicle max capacity limit: ${activeVehicleObj.max_load_capacity.toLocaleString()} kg`
    : '';

  // Pagination Slice
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = trips.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-brand-border/40 pb-5 gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-title uppercase tracking-wide">
            Active Dispatches
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
            Dispatch routes, verify weight limits, assign safety certified drivers, and track log statuses.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleOpenAdd}
          className="text-xs font-black uppercase tracking-wider"
          icon={FiPlus}
        >
          Dispatch Trip
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-brand-border">
        <div className="md:col-span-2">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by source or destination depot name..."
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={["Pending", "Loading", "On Trip", "Arriving", "Completed", "Cancelled", "Delayed"]}
          placeholder="All Trip Statuses"
        />
      </div>

      {/* Main Table view */}
      {loading ? (
        <Loader message="Loading dispatches logs..." />
      ) : (
        <div className="space-y-4">
          <Table 
            headers={["Trip ID", "Vehicle Name", "Driver", "Route (From → To)", "Cargo Weight", "Distance", "Status", "Actions"]}
            emptyMessage="No matching dispatch entries found."
          >
            {currentItems.map((trip) => (
              <tr key={trip.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="px-5 py-4 font-bold text-xs text-brand-accent tracking-wide uppercase">
                  #TR-{String(trip.id).padStart(5, '0')}
                </td>
                <td className="px-5 py-4 text-xs font-black text-slate-200 uppercase">
                  {trip.vehicle?.vehicle_name} <span className="text-[10px] text-slate-500 font-bold block">{trip.vehicle?.registration_number}</span>
                </td>
                <td className="px-5 py-4 text-xs text-slate-300 font-semibold">
                  {trip.driver?.name || 'Unassigned'}
                </td>
                <td className="px-5 py-4 text-xs text-slate-250 font-medium">
                  {trip.source} → {trip.destination}
                </td>
                <td className="px-5 py-4 text-xs text-slate-300">
                  {trip.cargo_weight.toLocaleString()} kg
                </td>
                <td className="px-5 py-4 text-xs text-slate-400">
                  {trip.actual_distance || trip.planned_distance} km
                </td>
                <td className="px-5 py-4">
                  <Badge status={trip.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center space-x-2">
                    {trip.status === "On Trip" && (
                      <>
                        <button
                          onClick={() => handleCompleteTrip(trip)}
                          className="p-1.5 rounded bg-emerald-950/40 border border-emerald-500/25 text-emerald-450 hover:bg-emerald-900/40 transition-colors"
                          title="Complete Trip"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCancelTrip(trip.id)}
                          className="p-1.5 rounded bg-rose-950/40 border border-rose-500/25 text-rose-455 hover:bg-rose-900/40 transition-colors"
                          title="Cancel Trip"
                        >
                          <FiXCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleOpenEdit(trip)}
                      className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-brand-title hover:bg-slate-700 transition-colors"
                      title="Edit Dispatch Log"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="p-1.5 rounded bg-red-950/20 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                      title="Delete Entry"
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
            totalItems={trips.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedTrip ? "Modify Dispatch Record" : "Book New Dispatch Route"}
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Select
            label="Select Fleet Unit"
            options={vehicles.map(v => ({ value: v.id, label: `${v.vehicle_name} (${v.registration_number})` }))}
            error={errors.vehicle_id}
            required
            {...register('vehicle_id', { required: 'Vehicle selection is required.', valueAsNumber: true })}
          />
          {capacityMessage && (
            <p className="text-[10px] text-brand-accent font-black uppercase tracking-wider -mt-2">
              {capacityMessage}
            </p>
          )}

          <Select
            label="Select Driver (Available)"
            options={drivers.map(d => ({ value: d.id, label: `${d.name} (${d.license_category})` }))}
            error={errors.driver_id}
            {...register('driver_id', { valueAsNumber: true })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Source Depot"
              placeholder="Mumbai Central Depot"
              error={errors.source}
              required
              {...register('source', { required: 'Source depot is required.' })}
            />
            <Input
              label="Destination Hub"
              placeholder="Pune Bypass Hub"
              error={errors.destination}
              required
              {...register('destination', { required: 'Destination hub is required.' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cargo Weight (kg)"
              placeholder="12000"
              type="number"
              error={errors.cargo_weight}
              required
              {...register('cargo_weight', { 
                required: 'Cargo load weight is required.', 
                valueAsNumber: true,
                min: { value: 1, message: 'Must be greater than 0.' }
              })}
            />
            <Input
              label="Planned Distance (km)"
              placeholder="150"
              type="number"
              error={errors.planned_distance}
              required
              {...register('planned_distance', { 
                required: 'Planned mileage distance is required.', 
                valueAsNumber: true,
                min: { value: 1, message: 'Must be greater than 0.' }
              })}
            />
          </div>

          <Select
            label="Initial Dispatch Status"
            options={["Pending", "Loading", "On Trip", "Arriving", "Completed", "Cancelled", "Delayed"]}
            placeholder=""
            {...register('status')}
          />

          <div className="flex justify-end space-x-3 pt-3 border-t border-brand-border/40">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Dispatch
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Trips;
