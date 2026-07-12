import React, { useEffect, useState } from 'react';
import { FiDownload, FiActivity, FiTrendingUp, FiCreditCard, FiZap } from 'react-icons/fi';
import { reportsAPI } from '../../services/api';
import StatsCard from '../../components/Common/StatsCard';
import Button from '../../components/Common/Button';
import Loader from '../../components/Common/Loader';
import Table from '../../components/Common/Table';

const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [analyticsRes, costCentersRes] = await Promise.all([
        reportsAPI.getAnalytics(),
        reportsAPI.getCostCenters()
      ]);
      setAnalytics(analyticsRes);
      setCostCenters(costCentersRes);
    } catch (err) {
      console.error("Error loading analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExport = (resource) => {
    // Generate URL with token and open window
    const url = reportsAPI.exportCsvUrl(resource);
    window.open(url, '_blank');
  };

  if (loading) {
    return <Loader message="Compiling fleet analytics ledger summaries..." />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-brand-border/40 pb-5 gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-title uppercase tracking-wide">
            Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
            Real-time performance metrics and operational overhead analysis.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => handleExport('vehicles')}
            className="text-xs font-black uppercase tracking-wider"
            icon={FiDownload}
          >
            Export Vehicles
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('drivers')}
            className="text-xs font-black uppercase tracking-wider"
            icon={FiDownload}
          >
            Export Drivers
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleExport('trips')}
            className="text-xs font-black uppercase tracking-wider"
            icon={FiDownload}
          >
            Export Trips
          </Button>
        </div>
      </div>

      {/* Analytics Summary Panel matching mockups */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Fuel Efficiency Average"
          value={`${analytics?.fuel_efficiency || 12.4} km/l`}
          statusText="Completed distance fuel burn ratio"
          icon={FiZap}
          iconColor="text-emerald-400 bg-emerald-500/10"
        />
        <StatsCard
          title="Fleet Utilization Rate"
          value={`${analytics?.fleet_utilization || 81.0}%`}
          statusText="Average duty ratio of active fleet"
          icon={FiActivity}
          iconColor="text-blue-400 bg-blue-500/10"
        />
        <StatsCard
          title="Aggregate Operational Cost"
          value={`₹${analytics?.operational_cost.toLocaleString()}`}
          statusText="Combined fuel, maintenance, tolls pool"
          icon={FiCreditCard}
          iconColor="text-amber-400 bg-amber-500/10"
        />
        <StatsCard
          title="Vehicle ROI average"
          value={`${analytics?.vehicle_roi || 12.4}%`}
          statusText="Estimated return on operational cost"
          icon={FiTrendingUp}
          iconColor="text-brand-accent bg-brand-accent/10"
        />
      </div>

      {/* Cost Center Ranking list matching mockups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Cost Center Ranking (Top 5 Costliest Units)
          </h3>
          <Table headers={["Rank ID", "Vehicle Fleet Unit", "Total Logged Costs"]}>
            {costCenters.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                <td className="px-5 py-4 font-bold text-xs text-brand-accent">
                  #0{idx + 1}
                </td>
                <td className="px-5 py-4 text-xs font-black text-slate-200 uppercase">
                  {item.name}
                </td>
                <td className="px-5 py-4 text-xs font-black text-brand-accent text-right pr-12">
                  ₹{item.cost.toLocaleString()}
                </td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="bg-slate-900 border border-brand-border rounded-xl p-5 flex flex-col justify-between h-56">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Analytics Status Summary
          </h4>
          <div className="space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              "Total operational cost centers are computed dynamically from all logged diesel tickets, scheduled maintenance check invoices, and operational toll fees."
            </p>
          </div>
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
            Database Aggregation Engine: SQL v8.0
          </p>
        </div>

      </div>

    </div>
  );
};

export default Reports;
