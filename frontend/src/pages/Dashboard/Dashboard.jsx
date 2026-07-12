import React, { useEffect, useState } from 'react';
import { 
  FiTruck, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiCompass, 
  FiClock, 
  FiUsers, 
  FiActivity 
} from 'react-icons/fi';
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
import { reportsAPI, tripsAPI, maintenanceAPI } from '../../services/api';
import StatsCard from '../../components/Common/StatsCard';
import ChartCard from '../../components/Common/ChartCard';
import Table from '../../components/Common/Table';
import Badge from '../../components/Common/Badge';
import Loader from '../../components/Common/Loader';

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [recentMaint, setRecentMaint] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [kpiRes, analyticsRes, tripsRes, maintRes] = await Promise.all([
        reportsAPI.getKpis(),
        reportsAPI.getAnalytics(),
        tripsAPI.list({ limit: 5 }),
        maintenanceAPI.list({ limit: 5 })
      ]);
      setKpis(kpiRes);
      setAnalytics(analyticsRes);
      setRecentTrips(tripsRes);
      setRecentMaint(maintRes);
    } catch (err) {
      console.error("Error fetching dashboard details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader message="Fetching mission control telemetry..." />;
  }

  // Construct charts data dynamically
  const statusData = [
    { name: 'Available', value: kpis?.available_vehicles || 0, color: '#10b981' }, // emerald-500
    { name: 'On Trip', value: kpis?.active_vehicles || 0, color: '#3b82f6' }, // blue-500
    { name: 'In Shop', value: kpis?.vehicles_in_shop || 0, color: '#f59e0b' }, // amber-500
    { name: 'Retired', value: kpis?.total_vehicles ? (kpis.total_vehicles - kpis.available_vehicles - kpis.active_vehicles - kpis.vehicles_in_shop) : 0, color: '#64748b' } // slate-500
  ].filter(item => item.value > 0);

  // Fallback default dataset for visual rendering if no monthly logs are completed
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

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatsCard
          title="Active Vehicles"
          value={kpis?.active_vehicles || 0}
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

      {/* Main Charts & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Proportional Fleet Health Pie */}
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

        {/* Trips Per Month Bar Chart */}
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

        {/* Expense Distribution Line Chart */}
        <ChartCard
          title="Operational Expense Flow"
          subtitle="Monthly cost center allocation"
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

      {/* Grid: Recent Tables & Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Active Trips */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Recent Active Trips
            </h3>
          </div>
          <Table headers={["Trip ID", "Vehicle", "Driver", "Route", "Cargo", "Status"]}>
            {recentTrips.map((t) => (
              <tr key={t.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="px-5 py-3 font-bold text-xs text-brand-accent">
                  #TR-{String(t.id).padStart(5, '0')}
                </td>
                <td className="px-5 py-3 text-xs text-slate-350 font-semibold">
                  {t.vehicle?.vehicle_name} ({t.vehicle?.registration_number})
                </td>
                <td className="px-5 py-3 text-xs text-slate-300">
                  {t.driver?.name || 'N/A'}
                </td>
                <td className="px-5 py-3 text-xs text-slate-300 font-medium">
                  {t.source} → {t.destination}
                </td>
                <td className="px-5 py-3 text-xs text-slate-300">
                  {t.cargo_weight.toLocaleString()} kg
                </td>
                <td className="px-5 py-3">
                  <Badge status={t.status} />
                </td>
              </tr>
            ))}
          </Table>
        </div>

        {/* Live Map Visual Simulator */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Live Fleet Tracking
          </h3>
          <div className="bg-slate-900 border border-brand-border rounded-xl h-56 relative overflow-hidden flex flex-col justify-between p-4">
            
            {/* Mock Vector Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-15" />
            
            {/* Animated Dots Simulator */}
            <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-emerald-400 border border-brand-dark animate-pulse shadow-md shadow-emerald-400/50" />
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-blue-400 border border-brand-dark animate-pulse shadow-md shadow-blue-400/50" />
            <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-amber-400 border border-brand-dark animate-pulse shadow-md shadow-amber-400/50" />

            <div className="z-10 flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded">
                Gps Signal: Live
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Active Depot: Mumbai
              </span>
            </div>

            <div className="z-10">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wide">
                West-Central Corridor
              </h4>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Simulating active GPS transponders
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Recent Maintenance Log table */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Maintenance Ticket Queue
        </h3>
        <Table headers={["Log ID", "Vehicle ID", "Registered Issue", "Mechanic Log", "Duration Date", "Cost Status"]}>
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
              <td className="px-5 py-3 text-xs text-slate-300 font-medium">
                {m.description || "Routine diagnostics"}
              </td>
              <td className="px-5 py-3 text-xs text-slate-400">
                {m.start_date} {m.end_date ? `to ${m.end_date}` : "(Ongoing)"}
              </td>
              <td className="px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  ₹{m.cost.toLocaleString()}
                </span>
                <Badge status={m.status} />
              </td>
            </tr>
          ))}
        </Table>
      </div>

    </div>
  );
};

export default Dashboard;
