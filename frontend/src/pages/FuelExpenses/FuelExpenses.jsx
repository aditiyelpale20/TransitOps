import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiTrendingUp, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { fuelAPI, expensesAPI, vehiclesAPI } from '../../services/api';
import Table from '../../components/Common/Table';
import Badge from '../../components/Common/Badge';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Modal from '../../components/Common/Modal';
import Pagination from '../../components/Common/Pagination';
import Loader from '../../components/Common/Loader';
import StatsCard from '../../components/Common/StatsCard';

const FuelExpenses = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination parameters
  const [fuelPage, setFuelPage] = useState(1);
  const [expPage, setExpPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isFuelOpen, setIsFuelOpen] = useState(false);
  const [isExpOpen, setIsExpOpen] = useState(false);

  const { register: registerFuel, handleSubmit: handleFuelSubmit, reset: resetFuel, formState: { errors: fuelErrors } } = useForm();
  const { register: registerExp, handleSubmit: handleExpSubmit, reset: resetExp, formState: { errors: expErrors } } = useForm();

  const fetchLedgers = async () => {
    setLoading(true);
    try {
      const [fuelRes, expRes, vehiclesRes] = await Promise.all([
        fuelAPI.list(),
        expensesAPI.list(),
        vehiclesAPI.list()
      ]);
      setFuelLogs(fuelRes);
      setExpenses(expRes);
      setVehicles(vehiclesRes.filter(v => v.status !== "Retired"));
    } catch (err) {
      console.error("Error loading expense databases", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgers();
  }, []);

  const onFuelSubmit = async (data) => {
    try {
      await fuelAPI.create(data);
      setIsFuelOpen(false);
      resetFuel({ vehicle_id: '', liters: '', cost: '' });
      fetchLedgers();
    } catch (err) {
      alert(err.response?.data?.detail || "Error logging fuel entry.");
    }
  };

  const onExpSubmit = async (data) => {
    try {
      await expensesAPI.create(data);
      setIsExpOpen(false);
      resetExp({ vehicle_id: '', type: 'Toll', amount: '', description: '' });
      fetchLedgers();
    } catch (err) {
      alert(err.response?.data?.detail || "Error logging expense entry.");
    }
  };

  const handleDeleteFuel = async (id) => {
    if (window.confirm("Are you sure you want to delete this fuel log?")) {
      try {
        await fuelAPI.delete(id);
        fetchLedgers();
      } catch (err) {
        alert(err.response?.data?.detail || "Error deleting log.");
      }
    }
  };

  const handleDeleteExp = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense record?")) {
      try {
        await expensesAPI.delete(id);
        fetchLedgers();
      } catch (err) {
        alert(err.response?.data?.detail || "Error deleting expense.");
      }
    }
  };

  // Compute summary stats
  const totalLiters = fuelLogs.reduce((acc, l) => acc + l.liters, 0);
  const totalFuelCost = fuelLogs.reduce((acc, l) => acc + l.cost, 0);
  const totalOtherCost = expenses.reduce((acc, e) => acc + e.amount, 0);
  const overallExpenses = totalFuelCost + totalOtherCost;

  // Pagination Slice: Fuel
  const fuelLast = fuelPage * itemsPerPage;
  const fuelFirst = fuelLast - itemsPerPage;
  const currentFuelItems = fuelLogs.slice(fuelFirst, fuelLast);

  // Pagination Slice: Expenses
  const expLast = expPage * itemsPerPage;
  const expFirst = expLast - itemsPerPage;
  const currentExpItems = expenses.slice(expFirst, expLast);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-brand-border/40 pb-5 gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-title uppercase tracking-wide">
            Fuel Logs & Expenses
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
            Real-time fiscal monitoring, diesel purchases, toll records, and operational overhead costs.
          </p>
        </div>
        <div className="flex items-center space-x-3.5">
          <Button 
            variant="outline" 
            onClick={() => setIsFuelOpen(true)}
            className="text-xs font-black uppercase tracking-wider"
            icon={FiPlus}
          >
            Log Fuel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setIsExpOpen(true)}
            className="text-xs font-black uppercase tracking-wider"
            icon={FiPlus}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Summary Panel matching mockups */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Diesel Total Consumed"
          value={`${totalLiters.toLocaleString()} Liters`}
          statusText="Cumulative diesel fill volume"
          icon={FiTrendingUp}
          iconColor="text-blue-400 bg-blue-500/10"
        />
        <StatsCard
          title="Aggregate Fuel Bill"
          value={`₹${totalFuelCost.toLocaleString()}`}
          statusText="Total spent on diesel logs"
          icon={FiDollarSign}
          iconColor="text-emerald-400 bg-emerald-500/10"
        />
        <StatsCard
          title="Tolls & Permits Overhead"
          value={`₹${totalOtherCost.toLocaleString()}`}
          statusText="Total spent on tolls, permits, insurance"
          icon={FiCreditCard}
          iconColor="text-amber-400 bg-amber-500/10"
        />
        <StatsCard
          title="Overall Fiscal Burn"
          value={`₹${overallExpenses.toLocaleString()}`}
          statusText="Combined operational expense pool"
          icon={FiTrendingUp}
          iconColor="text-brand-accent bg-brand-accent/10"
        />
      </div>

      {loading ? (
        <Loader message="Fetching fiscal logs databases..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Fuel logs table matching mockups */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
              Fuel Logs Registry
            </h3>
            <Table headers={["Vehicle", "Refill Date", "Refill Qty", "Refill Cost", "Actions"]}>
              {currentFuelItems.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-black text-slate-200 uppercase">
                    {log.vehicle?.vehicle_name} <span className="text-[9px] text-slate-500 block font-bold">{log.vehicle?.registration_number}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-300 font-medium">
                    {log.liters.toLocaleString()} L
                  </td>
                  <td className="px-5 py-3.5 text-xs text-brand-accent font-bold">
                    ₹{log.cost.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleDeleteFuel(log.id)}
                      className="p-1.5 rounded bg-red-950/20 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                      title="Delete Log"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
            <Pagination
              currentPage={fuelPage}
              totalItems={fuelLogs.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setFuelPage}
            />
          </div>

          {/* Other expenses table matching mockups */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
              Other Expense Ledgers
            </h3>
            <Table headers={["Vehicle", "Expense Type", "Logged Cost", "Description", "Actions"]}>
              {currentExpItems.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-black text-slate-200 uppercase">
                    {exp.vehicle?.vehicle_name} <span className="text-[9px] text-slate-500 block font-bold">{exp.vehicle?.registration_number}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={exp.type} />
                  </td>
                  <td className="px-5 py-3.5 text-xs font-black text-brand-accent">
                    ₹{exp.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-300 font-medium max-w-xs truncate">
                    {exp.description || 'N/A'}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleDeleteExp(exp.id)}
                      className="p-1.5 rounded bg-red-950/20 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                      title="Delete Record"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
            <Pagination
              currentPage={expPage}
              totalItems={expenses.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setExpPage}
            />
          </div>

        </div>
      )}

      {/* Log Fuel Modal */}
      <Modal isOpen={isFuelOpen} onClose={() => setIsFuelOpen(false)} title="Log Fuel Purchase" size="md">
        <form onSubmit={handleFuelSubmit(onFuelSubmit)} className="space-y-4">
          <Select
            label="Vehicle"
            options={vehicles.map(v => ({ value: v.id, label: `${v.vehicle_name} (${v.registration_number})` }))}
            error={fuelErrors.vehicle_id}
            required
            {...registerFuel('vehicle_id', { required: 'Vehicle selection is required.', valueAsNumber: true })}
          />
          <Input
            label="Diesel Volume (Liters)"
            placeholder="80"
            type="number"
            error={fuelErrors.liters}
            required
            {...registerFuel('liters', { 
              required: 'Diesel volume is required.', 
              valueAsNumber: true,
              min: { value: 1, message: 'Must be greater than 0.' }
            })}
          />
          <Input
            label="Purchase Cost (INR)"
            placeholder="7200"
            type="number"
            error={fuelErrors.cost}
            required
            {...registerFuel('cost', { 
              required: 'Fuel cost bill is required.', 
              valueAsNumber: true,
              min: { value: 1, message: 'Must be greater than 0.' }
            })}
          />
          <div className="flex justify-end space-x-3 pt-3 border-t border-brand-border/40">
            <Button variant="outline" onClick={() => setIsFuelOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Log Refill</Button>
          </div>
        </form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal isOpen={isExpOpen} onClose={() => setIsExpOpen(false)} title="Add Operational Expense" size="md">
        <form onSubmit={handleExpSubmit(onExpSubmit)} className="space-y-4">
          <Select
            label="Vehicle"
            options={vehicles.map(v => ({ value: v.id, label: `${v.vehicle_name} (${v.registration_number})` }))}
            error={expErrors.vehicle_id}
            required
            {...registerExp('vehicle_id', { required: 'Vehicle is required.', valueAsNumber: true })}
          />
          <Select
            label="Expense Type"
            options={["Toll", "Permit", "Insurance", "Miscellaneous", "Maintenance Overhead"]}
            placeholder=""
            {...registerExp('type')}
          />
          <Input
            label="Expense Cost Amount (INR)"
            placeholder="1500"
            type="number"
            error={expErrors.amount}
            required
            {...registerExp('amount', { 
              required: 'Expense cost amount is required.', 
              valueAsNumber: true,
              min: { value: 1, message: 'Must be greater than 0.' }
            })}
          />
          <Input
            label="Cost Center Description"
            placeholder="Permit renew, NH-4 Highway toll fee..."
            error={expErrors.description}
            {...registerExp('description')}
          />
          <div className="flex justify-end space-x-3 pt-3 border-t border-brand-border/40">
            <Button variant="outline" onClick={() => setIsExpOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Log Expense</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default FuelExpenses;
