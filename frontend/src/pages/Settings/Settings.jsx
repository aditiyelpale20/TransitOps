import React from 'react';
import { FiSave, FiLock, FiCheck, FiEye } from 'react-icons/fi';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';

const Settings = () => {
  const permissions = [
    { role: 'Fleet Manager', description: 'Full Operational Control', fleet: 'full', drivers: 'full', trips: 'full', fuel: 'view', analytics: 'full' },
    { role: 'Dispatcher', description: 'Daily Trip Logistics', fleet: 'view', drivers: 'view', trips: 'full', fuel: 'none', analytics: 'view' },
    { role: 'Safety Officer', description: 'Compliance & Auditing', fleet: 'view', drivers: 'full', trips: 'view', fuel: 'none', analytics: 'view' },
    { role: 'Financial Analyst', description: 'Cost & Efficiency Audit', fleet: 'view', drivers: 'none', trips: 'view', fuel: 'full', analytics: 'full' }
  ];

  const renderIndicator = (level) => {
    if (level === 'full') {
      return (
        <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-emerald-950/45 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-wider justify-center w-24 mx-auto">
          <FiCheck className="w-3 h-3" />
          <span>Full</span>
        </div>
      );
    }
    if (level === 'view') {
      return (
        <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-blue-950/45 border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase tracking-wider justify-center w-24 mx-auto">
          <FiEye className="w-3 h-3" />
          <span>View Only</span>
        </div>
      );
    }
    return (
      <span className="text-[9px] font-bold text-slate-650 uppercase tracking-widest text-slate-500 text-center block">—</span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-brand-border/40 pb-5">
        <h1 className="text-2xl font-black text-brand-title uppercase tracking-wide">
          Settings & Security Control
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
          Configure global operational parameters and access control matrices for your fleet depot.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Depot configuration settings matching mockups */}
        <div className="lg:col-span-1">
          <Card title="Depot Settings" subtitle="Configure main operational center">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Depot configuration updated successfully."); }}>
              <Input
                label="Depot Name"
                defaultValue="Main Hub - Mumbai Central"
                required
              />
              <Select
                label="Operational Currency"
                options={["Indian Rupee (INR)", "US Dollar (USD)", "Euro (EUR)"]}
                placeholder=""
                defaultValue="Indian Rupee (INR)"
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Distance Unit Selection
                </label>
                <div className="flex bg-slate-950 p-1.5 rounded-lg border border-brand-border/80">
                  <button type="button" className="flex-1 text-center text-xs font-black uppercase py-2 bg-brand-accent text-brand-dark rounded-md">
                    KM
                  </button>
                  <button type="button" className="flex-1 text-center text-xs font-black uppercase py-2 text-slate-500">
                    Miles
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Depot Signature Logo
                </label>
                <div className="border border-dashed border-brand-border/80 rounded-lg p-6 flex flex-col items-center justify-center space-y-2 bg-slate-900/30">
                  <FiLock className="w-5 h-5 text-slate-500" />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Main Hub Central Signature
                  </span>
                  <p className="text-[8px] font-semibold text-slate-550 text-slate-500 uppercase tracking-widest">
                    Signature registered on database
                  </p>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full font-black uppercase text-xs py-2.5" icon={FiSave}>
                Save Changes
              </Button>
            </form>
          </Card>
        </div>

        {/* Access Matrix controls matching mockups */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-brand-border rounded-xl p-5 shadow-lg space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
                Access Control Matrix
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                Workspace access permissions rules
              </p>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-brand-border bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="px-4 py-3">System Role</th>
                    <th className="px-4 py-3 text-center">Fleet</th>
                    <th className="px-4 py-3 text-center">Drivers</th>
                    <th className="px-4 py-3 text-center">Trips</th>
                    <th className="px-4 py-3 text-center">Fuel/Exp</th>
                    <th className="px-4 py-3 text-center">Analytics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {permissions.map((item) => (
                    <tr key={item.role} className="hover:bg-slate-900/10 transition-colors">
                      <td className="px-4 py-4.5">
                        <span className="font-black text-slate-200 uppercase tracking-wide block">{item.role}</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">{item.description}</span>
                      </td>
                      <td className="px-4 py-4.5">{renderIndicator(item.fleet)}</td>
                      <td className="px-4 py-4.5">{renderIndicator(item.drivers)}</td>
                      <td className="px-4 py-4.5">{renderIndicator(item.trips)}</td>
                      <td className="px-4 py-4.5">{renderIndicator(item.fuel)}</td>
                      <td className="px-4 py-4.5">{renderIndicator(item.analytics)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pro Tips Footer */}
            <div className="bg-slate-950 p-4 border border-brand-border/60 rounded-xl flex items-center space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse shrink-0" />
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                Security Compliance Mode is Active. Audit logging records all workspace configuration updates.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Settings;
