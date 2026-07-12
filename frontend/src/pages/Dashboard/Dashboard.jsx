import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiTruck, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiCompass, 
  FiClock, 
  FiUsers, 
  FiActivity,
  FiTrendingUp,
  FiShield,
  FiPlus,
  FiAlertTriangle
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { 
  reportsAPI, 
  tripsAPI, 
  maintenanceAPI, 
  vehiclesAPI, 
  driversAPI, 
  expensesAPI 
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/Common/StatsCard';
import ChartCard from '../../components/Common/ChartCard';
import Table from '../../components/Common/Table';
import Badge from '../../components/Common/Badge';
import Loader from '../../components/Common/Loader';
import Button from '../../components/Common/Button';

// ----------------------------------------------------
// COMMON WELCOME BANNER
// ----------------------------------------------------
const WelcomeBanner = ({ user, acronym, statusText, onSignOut }) => (
  <div className="bg-slate-900/60 border border-brand-border/60 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent font-black text-xl shrink-0">
        {acronym}
      </div>
      <div>
        <h2 className="text-sm font-black text-slate-100 uppercase tracking-wide">
          Welcome back, {user?.name || 'Operator'}!
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Access Level: <span className="text-brand-accent">{user?.role}</span> • System Status: <span className="text-emerald-400">{statusText}</span>
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-5 self-start md:self-auto">
      <div className="text-left md:text-right hidden sm:block">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Active Station</span>
        <h4 className="text-xs font-black text-slate-200 mt-0.5">MUMBAI CENTRAL HUB</h4>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="bg-red-950/40 hover:bg-red-950/80 border border-red-500/25 text-red-400 font-black uppercase tracking-wider text-[10px] px-3.5 py-2 rounded-lg transition-colors active:scale-95 cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  </div>
);

// ----------------------------------------------------
// 1. FLEET MANAGER DASHBOARD VIEW
// ----------------------------------------------------
const FleetManagerView = ({ kpis, analytics, recentTrips, recentMaint, onActionSuccess }) => {
  const statusData = [
    { name: 'Available', value: kpis?.available_vehicles || 0, color: '#10b981' }, 
    { name: 'On Trip', value: kpis?.active_vehicles || 0, color: '#3b82f6' }, 
    { name: 'In Shop', value: kpis?.vehicles_in_shop || 0, color: '#f59e0b' }, 
    { name: 'Retired', value: kpis?.total_vehicles ? (kpis.total_vehicles - kpis.available_vehicles - kpis.active_vehicles - kpis.vehicles_in_shop) : 0, color: '#64748b' }
  ].filter(item => item.value > 0);

  const tripTrendData = [
    { name: 'Jan', Completed: 12, Active: 3 },
    { name: 'Feb', Completed: 18, Active: 4 },
    { name: 'Mar', Completed: 22, Active: 6 },
    { name: 'Apr', Completed: 25, Active: 5 },
    { name: 'May', Completed: 28, Active: 8 },
    { name: 'Jun', Completed: 35, Active: kpis?.active_trips || 9 }
  ];

  const expenseTrendData = [
    { name: 'Jan', Fuel: 45000, Maintenance: 15000 },
    { name: 'Feb', Fuel: 52000, Maintenance: 12000 },
    { name: 'Mar', Fuel: 49000, Maintenance: 24000 },
    { name: 'Apr', Fuel: 61000, Maintenance: 18000 },
    { name: 'May', Fuel: 55000, Maintenance: 32000 },
    { name: 'Jun', Fuel: 72000, Maintenance: analytics?.operational_cost ? Math.round(analytics.operational_cost * 0.3) : 28000 }
  ];

  const handleResolveTicket = async (maintId) => {
    if (window.confirm("Mark this maintenance ticket as completed?")) {
      try {
        await maintenanceAPI.update(maintId, { status: "Completed" });
        onActionSuccess();
      } catch (err) {
        alert("Failed to update maintenance ticket: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatsCard
          title="Total Vehicles"
          value={kpis?.total_vehicles || 0}
          icon={FiTruck}
          iconColor="text-blue-400 bg-blue-500/10"
        />
        <StatsCard
          title="Available Fleet"
          value={kpis?.available_vehicles || 0}
          icon={FiCheckCircle}
          iconColor="text-emerald-400 bg-emerald-500/10"
        />
        <StatsCard
          title="In Maintenance"
          value={kpis?.vehicles_in_shop || 0}
          icon={FiAlertCircle}
          iconColor="text-amber-400 bg-amber-500/10"
        />
        <StatsCard
          title="Active Trips"
          value={kpis?.active_trips || 0}
          icon={FiCompass}
          iconColor="text-indigo-400 bg-indigo-500/10"
        />
        <StatsCard
          title="Pending Bookings"
          value={kpis?.pending_trips || 0}
          icon={FiClock}
          iconColor="text-slate-400 bg-slate-500/10"
        />
        <StatsCard
          title="Drivers On Duty"
          value={kpis?.drivers_on_duty || 0}
          icon={FiUsers}
          iconColor="text-teal-400 bg-teal-500/10"
        />
        <StatsCard
          title="Fleet Utilization"
          value={`${kpis?.fleet_utilization_pct || 0}%`}
          icon={FiActivity}
          iconColor="text-brand-accent bg-brand-accent/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Fleet Status Distribution"
          subtitle="Proportional health segment split"
        >
          {statusData.length === 0 ? (
            <span className="text-xs text-slate-500">No active assets registered.</span>
          ) : (
            <div className="w-full flex flex-col items-center">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f3f4f6' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wide">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Trips Tracking Trend"
          subtitle="Monthly volume variations"
        >
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={tripTrendData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f3f4f6' }} />
              <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
              <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Active" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Expense Allocations"
          subtitle="Operational maintenance cost flow"
        >
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={expenseTrendData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f3f4f6' }} />
              <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
              <Line type="monotone" dataKey="Fuel" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Maintenance" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
            Maintenance Ticket Queue
          </h3>
          <Table headers={["Log ID", "Vehicle Fleet Unit", "Registered Issue", "Duration Date", "Billing Status", "Actions"]}>
            {recentMaint.map((m) => (
              <tr key={m.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="px-5 py-3 font-bold text-xs text-brand-accent">
                  #MT-{String(m.id).padStart(5, '0')}
                </td>
                <td className="px-5 py-3 text-xs text-slate-350 font-semibold">
                  {m.vehicle?.vehicle_name} ({m.vehicle?.registration_number})
                </td>
                <td className="px-5 py-3 text-xs text-slate-300">
                  {m.issue}
                </td>
                <td className="px-5 py-3 text-xs text-slate-400">
                  {m.start_date} {m.end_date ? `to ${m.end_date}` : "(Ongoing)"}
                </td>
                <td className="px-5 py-3 text-xs font-bold text-slate-300">
                  ₹{m.cost.toLocaleString()}
                </td>
                <td className="px-5 py-3 flex items-center space-x-3">
                  <Badge status={m.status} />
                  {m.status === "Active (In Shop)" && (
                    <button
                      onClick={() => handleResolveTicket(m.id)}
                      className="text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-350 bg-emerald-950/45 px-2 py-0.5 border border-emerald-500/20 rounded transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
            Recent Trips Summary
          </h3>
          <div className="bg-slate-900/60 border border-brand-border/60 rounded-xl p-4 space-y-3.5 max-h-[260px] overflow-y-auto">
            {recentTrips.map((t) => (
              <div key={t.id} className="flex justify-between items-center border-b border-brand-border/30 pb-3 last:border-0 last:pb-0">
                <div>
                  <h5 className="text-[10px] font-black text-brand-accent uppercase tracking-wide">
                    #TR-{String(t.id).padStart(5, '0')}
                  </h5>
                  <p className="text-[11px] font-semibold text-slate-200 mt-0.5">
                    {t.source} → {t.destination}
                  </p>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">
                    Vehicle: {t.vehicle?.registration_number || 'N/A'}
                  </span>
                </div>
                <Badge status={t.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 2. DISPATCHER DASHBOARD VIEW (FULLY INTERACTIVE)
// ----------------------------------------------------
const ActiveTripTelemetry = ({ trip, onComplete }) => {
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchTelemetry = async () => {
      try {
        const data = await tripsAPI.getTelemetry(trip.id);
        if (active) {
          setTelemetry(data);
        }
      } catch (err) {
        console.error("Error fetching telemetry", err);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [trip.id]);

  return (
    <div className="border-b border-brand-border/30 pb-4 last:border-0 last:pb-0 space-y-2.5">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <h5 className="text-[10px] font-black text-brand-accent uppercase tracking-wide">
              #TR-{String(trip.id).padStart(5, '0')}
            </h5>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 uppercase">
            {trip.source} → {trip.destination}
          </p>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 block">
            {trip.driver?.name || 'No Driver'} • {trip.vehicle?.registration_number || 'No Vehicle'}
          </span>
          {telemetry?.weather && (
            <span className={`inline-flex items-center space-x-1 text-[8px] font-black uppercase px-2 py-0.5 rounded border mt-1.5 ${
              telemetry.weather.status === 'Warning'
                ? 'bg-red-950/45 border-red-500/20 text-red-400 animate-pulse'
                : telemetry.weather.status === 'Caution'
                  ? 'bg-amber-950/45 border-amber-500/20 text-amber-400'
                  : 'bg-emerald-950/45 border-emerald-500/20 text-emerald-400'
            }`}>
              <span>{telemetry.weather.icon === 'sunny' ? '☀️' : telemetry.weather.icon === 'rain' ? '🌧️' : telemetry.weather.icon === 'fog' ? '🌫️' : telemetry.weather.icon === 'wind' ? '💨' : '⛅'}</span>
              <span>{telemetry.weather.condition}</span>
            </span>
          )}
        </div>
        {telemetry && (
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-brand-accent tracking-wider block">
              {telemetry.speed} KM/H
            </span>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mt-0.5">
              {telemetry.lat}, {telemetry.lng}
            </span>
          </div>
        )}
      </div>

      {telemetry && (
        <div className="space-y-1.5 bg-slate-950/65 border border-brand-border/40 rounded-lg p-2.5">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
            <span>Progress: {telemetry.progress_pct}%</span>
            <span>Rem: {telemetry.distance_remaining} km ({telemetry.eta_minutes}m ETA)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-brand-accent h-full transition-all duration-1000 ease-out" 
              style={{ width: `${telemetry.progress_pct}%` }}
            />
          </div>
        </div>
      )}

      {telemetry?.weather && telemetry.weather.status !== 'Clear' && (
        <div className={`text-[9px] font-extrabold uppercase tracking-wide px-2.5 py-1.5 rounded-lg border flex items-center space-x-2 ${
          telemetry.weather.status === 'Warning'
            ? 'bg-red-950/30 border-red-500/15 text-red-400/90 animate-pulse'
            : 'bg-amber-950/30 border-amber-500/15 text-amber-400/90'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping shrink-0" />
          <span>Speed restricted due to {telemetry.weather.condition}</span>
        </div>
      )}

      <button
        onClick={() => onComplete(trip.id, trip.planned_distance)}
        className="w-full text-center text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-350 bg-emerald-950/45 py-2 border border-emerald-500/20 rounded transition-colors"
      >
        Complete Log
      </button>
    </div>
  );
};

const DispatcherView = ({ vehicles, drivers, trips, onActionSuccess }) => {
  const pendingTrips = trips.filter(t => t.status === "Pending");
  const activeTrips = trips.filter(t => t.status === "On Trip");
  const availableVehicles = vehicles.filter(v => v.status === "Available");
  
  // Filter drivers who are Available and have valid (unexpired) licenses
  const todayStr = new Date().toISOString().split('T')[0];
  const availableDrivers = drivers.filter(d => d.status === "Available" && d.license_expiry >= todayStr);

  const [assignments, setAssignments] = useState({});

  const handleSelectVehicle = (tripId, vehicleId) => {
    setAssignments(prev => ({
      ...prev,
      [tripId]: { ...prev[tripId], vehicle_id: Number(vehicleId) }
    }));
  };

  const handleSelectDriver = (tripId, driverId) => {
    setAssignments(prev => ({
      ...prev,
      [tripId]: { ...prev[tripId], driver_id: Number(driverId) }
    }));
  };

  const handleDispatch = async (tripId) => {
    const assign = assignments[tripId];
    if (!assign?.vehicle_id || !assign?.driver_id) {
      alert("Please select both an available Vehicle and Driver to dispatch.");
      return;
    }

    try {
      await tripsAPI.update(tripId, {
        vehicle_id: assign.vehicle_id,
        driver_id: assign.driver_id,
        status: "On Trip"
      });
      // Clear temporary form selection
      setAssignments(prev => {
        const copy = { ...prev };
        delete copy[tripId];
        return copy;
      });
      onActionSuccess();
    } catch (err) {
      alert("Failed to dispatch trip: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleCompleteTrip = async (tripId, plannedDistance) => {
    const actual = prompt("Enter actual distance traveled (km):", plannedDistance);
    if (actual === null) return; // cancelled prompt
    
    const actualDist = Number(actual) || plannedDistance;
    const fuelVal = Math.round((actualDist / 5.2) * 10) / 10; // average 5.2 km/l

    try {
      await tripsAPI.update(tripId, {
        status: "Completed",
        actual_distance: actualDist,
        fuel_consumed: fuelVal
      });
      onActionSuccess();
    } catch (err) {
      alert("Failed to complete trip: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Active Trips"
          value={activeTrips.length}
          icon={FiCompass}
          iconColor="text-blue-400 bg-blue-500/10"
        />
        <StatsCard
          title="Pending Queue"
          value={pendingTrips.length}
          icon={FiClock}
          iconColor="text-amber-400 bg-amber-500/10"
        />
        <StatsCard
          title="Available Vehicles"
          value={availableVehicles.length}
          icon={FiTruck}
          iconColor="text-indigo-400 bg-indigo-500/10"
        />
        <StatsCard
          title="Available Drivers"
          value={availableDrivers.length}
          icon={FiUsers}
          iconColor="text-emerald-400 bg-emerald-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
            Pending Dispatch Queue
          </h3>
          
          {pendingTrips.length === 0 ? (
            <div className="bg-slate-900/40 border border-brand-border/60 rounded-xl p-8 text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                All scheduled transit bookings successfully dispatched.
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTrips.map((trip) => {
                const selected = assignments[trip.id] || {};
                return (
                  <div key={trip.id} className="bg-slate-900/60 border border-brand-border/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-black text-brand-accent uppercase tracking-wide">
                          #TR-{String(trip.id).padStart(5, '0')}
                        </h4>
                        <span className="text-[10px] text-slate-500">• Cargo: {trip.cargo_weight.toLocaleString()} kg</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-200 uppercase">
                        {trip.source} → {trip.destination}
                      </p>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                        Planned Route Distance: {trip.planned_distance} km
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3.5">
                      {/* Vehicle selection */}
                      <select
                        value={selected.vehicle_id || ""}
                        onChange={(e) => handleSelectVehicle(trip.id, e.target.value)}
                        className="bg-slate-950 border border-brand-border/60 focus:border-brand-accent text-slate-100 rounded-lg p-2 text-[11px] font-semibold uppercase tracking-wider focus:outline-none"
                      >
                        <option value="">-- Choose Truck --</option>
                        {availableVehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.vehicle_name} ({v.registration_number})
                          </option>
                        ))}
                      </select>

                      {/* Driver selection */}
                      <select
                        value={selected.driver_id || ""}
                        onChange={(e) => handleSelectDriver(trip.id, e.target.value)}
                        className="bg-slate-950 border border-brand-border/60 focus:border-brand-accent text-slate-100 rounded-lg p-2 text-[11px] font-semibold uppercase tracking-wider focus:outline-none"
                      >
                        <option value="">-- Choose Driver --</option>
                        {availableDrivers.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} (Score: {d.safety_score}%)
                          </option>
                        ))}
                      </select>

                      {/* Dispatch Trigger */}
                      <button
                        onClick={() => handleDispatch(trip.id)}
                        className="bg-brand-accent hover:bg-brand-accent/80 text-brand-dark font-black uppercase tracking-wider text-[10px] px-3.5 py-2.5 rounded-lg transition-all shadow-md shadow-brand-accent/15"
                      >
                        Dispatch
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
            Active Corridor Telemetry
          </h3>
          <div className="bg-slate-900/60 border border-brand-border/60 rounded-xl p-4 space-y-4 max-h-[360px] overflow-y-auto">
            {activeTrips.length === 0 ? (
              <span className="text-xs text-slate-500 font-semibold block text-center py-4">
                No active transit coordinates logged.
              </span>
            ) : (
              activeTrips.map((t) => (
                <ActiveTripTelemetry key={t.id} trip={t} onComplete={handleCompleteTrip} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. SAFETY OFFICER DASHBOARD VIEW (FULLY INTERACTIVE)
// ----------------------------------------------------
const SafetyOfficerView = ({ drivers, onActionSuccess }) => {
  const activeDrivers = drivers.filter(d => d.status === "On Trip");
  const suspendedDrivers = drivers.filter(d => d.status === "Suspended");
  const averageScore = drivers.length > 0 
    ? Math.round(drivers.reduce((acc, d) => acc + d.safety_score, 0) / drivers.length * 10) / 10 
    : 100;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const expiringLicenses = drivers.filter(d => {
    if (!d.license_expiry) return false;
    const diffTime = new Date(d.license_expiry) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });

  const [scoreUpdates, setScoreUpdates] = useState({});

  const handleAuditDriver = async (driverId, nextStatus) => {
    const message = nextStatus === "Suspended" 
      ? "Are you sure you want to suspend this driver from transit assignments?"
      : "Reinstate this driver back to active availability status?";
    
    if (window.confirm(message)) {
      try {
        await driversAPI.update(driverId, { status: nextStatus });
        onActionSuccess();
      } catch (err) {
        alert("Failed to audit driver status: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleScoreChange = (driverId, val) => {
    setScoreUpdates(prev => ({
      ...prev,
      [driverId]: val
    }));
  };

  const handleUpdateScore = async (driverId) => {
    const scoreVal = Number(scoreUpdates[driverId]);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
      alert("Please enter a valid safety score between 0 and 100.");
      return;
    }

    try {
      await driversAPI.update(driverId, { safety_score: scoreVal });
      setScoreUpdates(prev => {
        const copy = { ...prev };
        delete copy[driverId];
        return copy;
      });
      onActionSuccess();
    } catch (err) {
      alert("Failed to update driver safety score: " + (err.response?.data?.detail || err.message));
    }
  };

  // Sort drivers by safety score ascending (lowest safety score first - risk analysis)
  const sortedDrivers = [...drivers].sort((a, b) => a.safety_score - b.safety_score);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Average Fleet Score"
          value={`${averageScore} %`}
          icon={FiShield}
          iconColor="text-emerald-400 bg-emerald-500/10"
        />
        <StatsCard
          title="Active Suspensions"
          value={suspendedDrivers.length}
          icon={FiAlertTriangle}
          iconColor="text-red-400 bg-red-500/10"
        />
        <StatsCard
          title="License Warnings"
          value={expiringLicenses.length}
          icon={FiClock}
          iconColor="text-amber-400 bg-amber-500/10"
        />
        <StatsCard
          title="Drivers on Trip"
          value={activeDrivers.length}
          icon={FiCompass}
          iconColor="text-blue-400 bg-blue-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
            Driver Safety Risk Profiles
          </h3>
          <Table headers={["Driver Name", "License details", "Safety Rating", "Status", "Manual Score Adjust", "Controls"]}>
            {sortedDrivers.map((d) => (
              <tr key={d.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="px-5 py-3 font-bold text-xs text-slate-200">
                  {d.name}
                </td>
                <td className="px-5 py-3 text-[11px] text-slate-400">
                  <div>{d.license_number} ({d.license_category})</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Expires: {d.license_expiry}</div>
                </td>
                <td className="px-5 py-3 text-xs font-black">
                  <span className={d.safety_score < 80 ? 'text-red-400' : d.safety_score < 90 ? 'text-amber-400' : 'text-emerald-400'}>
                    {d.safety_score} %
                  </span>
                </td>
                <td className="px-5 py-3 text-xs">
                  <Badge status={d.status} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreUpdates[d.id] ?? ""}
                      placeholder="--"
                      onChange={(e) => handleScoreChange(d.id, e.target.value)}
                      className="w-12 bg-slate-950 border border-brand-border/60 focus:border-brand-accent text-slate-100 rounded p-1 text-[10px] focus:outline-none"
                    />
                    <button
                      onClick={() => handleUpdateScore(d.id)}
                      className="text-[9px] font-black uppercase text-brand-accent hover:text-brand-accent/80 border border-brand-accent/25 px-1.5 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {d.status === "Suspended" ? (
                    <button
                      onClick={() => handleAuditDriver(d.id, "Available")}
                      className="text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-350 bg-emerald-950/45 px-2 py-1 border border-emerald-500/20 rounded transition-colors"
                    >
                      Reinstate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAuditDriver(d.id, "Suspended")}
                      disabled={d.status === "On Trip"}
                      className={`text-[10px] font-black uppercase px-2 py-1 border border-red-500/20 rounded transition-colors ${
                        d.status === "On Trip" 
                          ? 'text-slate-600 bg-slate-900/20 border-transparent cursor-not-allowed' 
                          : 'text-red-400 hover:text-red-350 bg-red-950/20'
                      }`}
                    >
                      Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
            License Expiration Warnings
          </h3>
          <div className="bg-slate-900/60 border border-brand-border/60 rounded-xl p-4 space-y-3.5 max-h-[300px] overflow-y-auto">
            {expiringLicenses.length === 0 ? (
              <span className="text-xs text-slate-500 font-semibold block text-center py-4">
                No active driver licenses expiring within 30 days.
              </span>
            ) : (
              expiringLicenses.map((d) => (
                <div key={d.id} className="border-b border-brand-border/30 pb-3 last:border-0 last:pb-0 flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-black text-slate-200">{d.name}</h5>
                    <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                      Expiry: {d.license_expiry}
                    </p>
                    <span className="text-[9px] text-slate-500 mt-0.5 block font-bold uppercase tracking-widest">
                      Lic No: {d.license_number}
                    </span>
                  </div>
                  <Badge status="Warning" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 4. FINANCIAL ANALYST DASHBOARD VIEW (FULLY INTERACTIVE)
// ----------------------------------------------------
const FinancialAnalystView = ({ analytics, vehicles, expenses, onActionSuccess }) => {
  const [costCenters, setCostCenters] = useState([]);
  const [expenseForm, setExpenseForm] = useState({
    vehicle_id: "",
    type: "Toll",
    amount: "",
    description: ""
  });

  const fetchCostCenters = async () => {
    try {
      const cc = await reportsAPI.getCostCenters();
      setCostCenters(cc);
    } catch (err) {
      console.error("Failed to load cost ranking", err);
    }
  };

  useEffect(() => {
    fetchCostCenters();
  }, [expenses]);

  const handleInputChange = (field, value) => {
    setExpenseForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    const amt = Number(expenseForm.amount);
    if (!expenseForm.vehicle_id || isNaN(amt) || amt <= 0 || !expenseForm.description) {
      alert("Please check all fields and input a positive expense amount.");
      return;
    }

    try {
      await expensesAPI.create({
        vehicle_id: Number(expenseForm.vehicle_id),
        type: expenseForm.type,
        amount: amt,
        description: expenseForm.description
      });
      // Reset form
      setExpenseForm({
        vehicle_id: "",
        type: "Toll",
        amount: "",
        description: ""
      });
      onActionSuccess();
    } catch (err) {
      alert("Failed to submit expense invoice: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Operational Expense"
          value={`₹${analytics?.operational_cost?.toLocaleString() || '0'}`}
          icon={FaRupeeSign}
          iconColor="text-amber-400 bg-amber-500/10"
        />
        <StatsCard
          title="Avg Fuel Efficiency"
          value={`${analytics?.fuel_efficiency || '12.4'} km/l`}
          icon={FiActivity}
          iconColor="text-emerald-400 bg-emerald-500/10"
        />
        <StatsCard
          title="Estimated ROI"
          value={`${analytics?.vehicle_roi || '12.4'} %`}
          icon={FiTrendingUp}
          iconColor="text-blue-400 bg-blue-500/10"
        />
        <StatsCard
          title="Total Units Logged"
          value={`${vehicles.length} Units`}
          icon={FiTruck}
          iconColor="text-indigo-400 bg-indigo-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
            Operational Expense Ledger
          </h3>
          <Table headers={["Invoice ID", "Vehicle Fleet", "Category", "Billing Amount", "Description", "Date"]}>
            {expenses.slice(0, 7).map((e) => (
              <tr key={e.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="px-5 py-3.5 font-bold text-xs text-brand-accent">
                  #EX-{String(e.id).padStart(5, '0')}
                </td>
                <td className="px-5 py-3.5 text-xs font-black text-slate-200">
                  {e.vehicle?.vehicle_name || `ID: ${e.vehicle_id}`}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-400 font-semibold">
                  {e.type}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-200 font-black">
                  ₹{e.amount.toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-400">
                  {e.description || "Operational charge"}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500">
                  {e.date ? new Date(e.date).toLocaleDateString() : "--"}
                </td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="space-y-6">
          {/* Quick Log Expense Form */}
          <div className="bg-slate-900 border border-brand-border/60 rounded-xl p-5 shadow-lg space-y-4">
            <div>
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wide">
                Log Operational Expense
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                Register toll, permit, or miscellaneous charges
              </p>
            </div>
            
            <form onSubmit={handleSubmitExpense} className="space-y-3.5">
              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Select Fleet Unit</label>
                <select
                  value={expenseForm.vehicle_id}
                  onChange={(e) => handleInputChange("vehicle_id", e.target.value)}
                  className="w-full bg-slate-950 border border-brand-border/60 focus:border-brand-accent text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent/50"
                  required
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_name} ({v.registration_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Expense Type</label>
                  <select
                    value={expenseForm.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="w-full bg-slate-950 border border-brand-border/60 focus:border-brand-accent text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent/50"
                  >
                    <option value="Toll">Toll</option>
                    <option value="Permit">Permit</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Maintenance Overhead">Maintenance Overhead</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1500"
                    value={expenseForm.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className="w-full bg-slate-950 border border-brand-border/60 focus:border-brand-accent text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Description / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. NH-4 Toll tax payment"
                  value={expenseForm.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full bg-slate-950 border border-brand-border/60 focus:border-brand-accent text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent/50"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full text-xs font-black uppercase tracking-widest py-2.5 mt-2"
                icon={FiPlus}
              >
                Log Invoice
              </Button>
            </form>
          </div>

          {/* Cost Rank Centers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
              Top Cost Center Ranking
            </h3>
            <div className="bg-slate-900 border border-brand-border/60 rounded-xl p-4 space-y-3 max-h-[220px] overflow-y-auto">
              {costCenters.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-brand-border/30 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-brand-accent">#0{idx + 1}</span>
                    <span className="text-[11px] font-black text-slate-200 uppercase">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-300">₹{item.cost.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// MAIN DASHBOARD CONTEXT COMPONENT
// ----------------------------------------------------
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };
  
  const [kpis, setKpis] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [
        kpiRes, 
        analyticsRes, 
        vehRes, 
        drvRes, 
        tripRes, 
        maintRes, 
        expRes
      ] = await Promise.all([
        reportsAPI.getKpis(),
        reportsAPI.getAnalytics(),
        vehiclesAPI.list(),
        driversAPI.list(),
        tripsAPI.list({ limit: 100 }), // retrieve large set for filtering in role dashboards
        maintenanceAPI.list({ limit: 10 }),
        expensesAPI.list()
      ]);
      
      setKpis(kpiRes);
      setAnalytics(analyticsRes);
      setVehicles(vehRes);
      setDrivers(drvRes);
      setTrips(tripRes);
      setMaintenance(maintRes);
      setExpenses(expRes);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader message="Fetching mission control telemetry data..." />;
  }

  // Construct Welcome Banner Acronym
  let userAcronym = "FM";
  if (user?.role === "Dispatcher") userAcronym = "DS";
  if (user?.role === "Safety Officer") userAcronym = "SO";
  if (user?.role === "Financial Analyst") userAcronym = "FA";

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-brand-border/40 pb-5 gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-title uppercase tracking-wide">
            Mission Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
            Real-time fleet telemetry and active transit operations dashboard.
          </p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/45 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest self-start md:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Healthy</span>
        </div>
      </div>

      {/* User Information Banner */}
      <WelcomeBanner user={user} acronym={userAcronym} statusText="Database Synced" onSignOut={handleSignOut} />

      {/* Dynamic Role-Based Layout */}
      {user?.role === "Fleet Manager" ? (
        <FleetManagerView 
          kpis={kpis} 
          analytics={analytics} 
          recentTrips={trips.slice(0, 5)} 
          recentMaint={maintenance.slice(0, 5)} 
          onActionSuccess={fetchDashboardData}
        />
      ) : user?.role === "Dispatcher" ? (
        <DispatcherView 
          vehicles={vehicles} 
          drivers={drivers} 
          trips={trips} 
          onActionSuccess={fetchDashboardData}
        />
      ) : user?.role === "Safety Officer" ? (
        <SafetyOfficerView 
          drivers={drivers} 
          onActionSuccess={fetchDashboardData}
        />
      ) : user?.role === "Financial Analyst" ? (
        <FinancialAnalystView 
          analytics={analytics} 
          vehicles={vehicles} 
          expenses={expenses} 
          onActionSuccess={fetchDashboardData}
        />
      ) : (
        <FleetManagerView 
          kpis={kpis} 
          analytics={analytics} 
          recentTrips={trips.slice(0, 5)} 
          recentMaint={maintenance.slice(0, 5)} 
          onActionSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default Dashboard;
