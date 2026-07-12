import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiSliders, FiActivity, FiTool, FiCheckSquare, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { maintenanceAPI, vehiclesAPI } from '../../services/api';
import Table from '../../components/Common/Table';
import Badge from '../../components/Common/Badge';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Modal from '../../components/Common/Modal';
import Pagination from '../../components/Common/Pagination';
import SearchBar from '../../components/Common/SearchBar';
import Loader from '../../components/Common/Loader';
import Card from '../../components/Common/Card';

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination parameters
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchMaintenanceData = async () => {
    setLoading(true);
    try {
      const [logsRes, vehiclesRes] = await Promise.all([
        maintenanceAPI.list({
          search: searchQuery || undefined,
          status: statusFilter || undefined
        }),
        vehiclesAPI.list() // Load all for selection
      ]);
      setLogs(logsRes);
      setVehicles(vehiclesRes.filter(v => v.status !== "Retired"));
    } catch (err) {
      console.error("Error loading maintenance data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleFormSubmit = async (data) => {
    try {
      await maintenanceAPI.create({
        ...data,
        start_date: new Date().toISOString().split('T')[0],
        status: 'Active (In Shop)'
      });
      fetchMaintenanceData();
      reset({
        vehicle_id: '',
        issue: '',
        description: '',
        cost: ''
      });
    } catch (err) {
      alert(err.response?.data?.detail || "Error logging maintenance ticket.");
    }
  };

  const handleCloseTicket = async (id, currentCost) => {
    const finalCost = prompt("Enter final maintenance cost (INR):", currentCost || 500);
    if (finalCost === null) return;
    try {
      await maintenanceAPI.update(id, {
        status: 'Completed',
        cost: Number(finalCost)
      });
      fetchMaintenanceData();
    } catch (err) {
      alert(err.response?.data?.detail || "Error closing maintenance ticket.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this maintenance entry?")) {
      try {
        await maintenanceAPI.delete(id);
        fetchMaintenanceData();
      } catch (err) {
        alert(err.response?.data?.detail || "Error deleting log.");
      }
    }
  };

  // Compute stats
  const activeLogs = logs.filter(l => l.status === "Active (In Shop)");
  const inShopCount = activeLogs.length;
  const totalSpend = logs.reduce((acc, l) => acc + l.cost, 0);

  // Pagination Slice
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = logs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-brand-border/40 pb-5">
        <h1 className="text-2xl font-black text-brand-title uppercase tracking-wide">
          Maintenance & Repair Logs
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
          Track service logs, schedule engine checkups, manage mechanic entries, and verify shop timelines.
        </p>
      </div>

      {/* Progress Timeline Tracker matching mockups */}
      <div className="bg-slate-900 border border-brand-border rounded-xl p-5 shadow-lg">
        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-5">
          Service Process Flow Tracking
        </h4>
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          {/* Progress bar line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 w-1/2 h-1 bg-brand-accent -translate-y-1/2 z-0" />

          {/* Step 1 */}
          <div className="z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-950/60 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 font-bold shadow-lg">
              ✓
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mt-2">Available</span>
          </div>
          {/* Step 2 */}
          <div className="z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-brand-accent border-2 border-brand-dark flex items-center justify-center text-brand-dark font-black shadow-lg shadow-brand-accent/20">
              <FiTool className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent mt-2">In Shop</span>
          </div>
          {/* Step 3 */}
          <div className="z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-slate-500 font-bold">
              ↺
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">Release Available</span>
          </div>
        </div>
      </div>

      {/* Grid: Form and Logs list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Log Service Record Form matching mockups */}
        <div className="lg:col-span-1">
          <Card title="Log Service Record" subtitle="Open a new maintenance ticket">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <Select
                label="Vehicle Selection"
                options={vehicles.map(v => ({ value: v.id, label: `${v.vehicle_name} (${v.registration_number})` }))}
                error={errors.vehicle_id}
                required
                {...register('vehicle_id', { required: 'Vehicle is required.', valueAsNumber: true })}
              />

              <Input
                label="Service Type / Issue"
                placeholder="Oil Change, Engine Overheating..."
                error={errors.issue}
                required
                {...register('issue', { required: 'Service issue description is required.' })}
              />

              <Input
                label="Detailed Description"
                placeholder="Describe diagnostics or repair checks..."
                error={errors.description}
                {...register('description')}
              />

              <Input
                label="Estimated Cost (INR)"
                placeholder="4500"
                type="number"
                error={errors.cost}
                required
                {...register('cost', { 
                  required: 'Estimated cost is required.', 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be non-negative.' }
                })}
              />

              <Button type="submit" variant="primary" className="w-full font-black uppercase text-xs py-2.5">
                Save Service Record
              </Button>
            </form>
          </Card>
        </div>

        {/* Service Logs queue matching mockups */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-brand-border">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues, descriptions..."
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={["Active (In Shop)", "Completed"]}
              placeholder="All Statuses"
            />
          </div>

          {loading ? (
            <Loader message="Loading service database logs..." />
          ) : (
            <div className="space-y-4">
              <Table headers={["Vehicle ID", "Service Type", "Cost", "Date Logged", "Status", "Actions"]}>
                {currentItems.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-black text-slate-200 uppercase">
                      {log.vehicle?.vehicle_name} <span className="text-[10px] text-slate-500 font-bold block">{log.vehicle?.registration_number}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-300 font-medium">
                      {log.issue} <span className="text-[9px] text-slate-500 block truncate max-w-xs">{log.description || 'Routine checks'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-200">
                      ₹{log.cost.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {log.start_date} {log.end_date ? `to ${log.end_date}` : ""}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={log.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-2">
                        {log.status === "Active (In Shop)" && (
                          <button
                            onClick={() => handleCloseTicket(log.id, log.cost)}
                            className="p-1 rounded bg-emerald-950/40 border border-emerald-500/25 text-emerald-450 hover:bg-emerald-900/40 text-[10px] font-black uppercase tracking-wider px-2 py-1 transition-colors"
                            title="Close Ticket"
                          >
                            Release
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-1.5 rounded bg-red-950/20 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                          title="Delete Ticket"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>

              <Pagination
                currentPage={currentPage}
                totalItems={logs.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Maintenance;
