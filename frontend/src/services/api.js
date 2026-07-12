import {
  initialVehicles,
  initialDrivers,
  initialTrips,
  initialMaintenance,
  initialFuelLogs,
  initialExpenses
} from '../data/mockData';

// Helper to initialize local storage databases
const initLocalStorage = () => {
  if (!localStorage.getItem('vehicles')) localStorage.setItem('vehicles', JSON.stringify(initialVehicles));
  if (!localStorage.getItem('drivers')) localStorage.setItem('drivers', JSON.stringify(initialDrivers));
  if (!localStorage.getItem('trips')) localStorage.setItem('trips', JSON.stringify(initialTrips));
  if (!localStorage.getItem('maintenance')) localStorage.setItem('maintenance', JSON.stringify(initialMaintenance));
  if (!localStorage.getItem('fuel_logs')) localStorage.setItem('fuel_logs', JSON.stringify(initialFuelLogs));
  if (!localStorage.getItem('expenses')) localStorage.setItem('expenses', JSON.stringify(initialExpenses));
};

initLocalStorage();

const getLocal = (key) => JSON.parse(localStorage.getItem(key));
const setLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Stands in for Axios API services
export const authAPI = {
  login: async (email, password) => {
    // Basic verification logic for mock credentials
    const users = {
      'admin@transitops.com': { id: 1, name: 'Alex Rivera', email: 'admin@transitops.com', role: 'Fleet Manager', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
      'dispatcher@transitops.com': { id: 2, name: 'J. Carter', email: 'dispatcher@transitops.com', role: 'Dispatcher', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
      'safety@transitops.com': { id: 3, name: 'Vikram Singh', email: 'safety@transitops.com', role: 'Safety Officer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
      'finance@transitops.com': { id: 4, name: 'Sanjay Kumar', email: 'finance@transitops.com', role: 'Financial Analyst', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' }
    };

    const matched = users[email];
    if (matched && password.endsWith('123')) {
      return {
        access_token: 'mock_jwt_token_' + matched.id,
        user: matched
      };
    }
    throw { response: { data: { detail: 'Incorrect email address or password. Try standard role prefixes like admin123.' } } };
  },
  getMe: async () => {
    const user = JSON.parse(localStorage.getItem('transitops_user'));
    return user || { id: 1, name: 'Alex Rivera', email: 'admin@transitops.com', role: 'Fleet Manager' };
  }
};

export const vehiclesAPI = {
  list: async (params = {}) => {
    let list = getLocal('vehicles');
    if (params.search) {
      list = list.filter(v => 
        v.registration_number.toLowerCase().includes(params.search.toLowerCase()) ||
        v.vehicle_name.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    if (params.status) list = list.filter(v => v.status === params.status);
    if (params.type) list = list.filter(v => v.vehicle_type === params.type);
    return list;
  },
  get: async (id) => {
    return getLocal('vehicles').find(v => v.id === id);
  },
  create: async (data) => {
    const list = getLocal('vehicles');
    const existing = list.find(v => v.registration_number.toLowerCase() === data.registration_number.toLowerCase());
    if (existing) throw { response: { data: { detail: 'Registration plate number already exists.' } } };
    
    const newVeh = { ...data, id: list.length > 0 ? Math.max(...list.map(v => v.id)) + 1 : 1 };
    list.push(newVeh);
    setLocal('vehicles', list);
    return newVeh;
  },
  update: async (id, data) => {
    const list = getLocal('vehicles');
    const idx = list.findIndex(v => v.id === id);
    if (idx === -1) throw new Error("Vehicle not found");
    
    list[idx] = { ...list[idx], ...data };
    setLocal('vehicles', list);
    return list[idx];
  },
  delete: async (id) => {
    const list = getLocal('vehicles');
    const filtered = list.filter(v => v.id !== id);
    setLocal('vehicles', filtered);
    return { success: true };
  }
};

export const driversAPI = {
  list: async (params = {}) => {
    let list = getLocal('drivers');
    if (params.search) {
      list = list.filter(d => 
        d.name.toLowerCase().includes(params.search.toLowerCase()) ||
        d.license_number.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    if (params.status) list = list.filter(d => d.status === params.status);
    if (params.category) list = list.filter(d => d.license_category === params.category);
    return list;
  },
  create: async (data) => {
    const list = getLocal('drivers');
    const existing = list.find(d => d.license_number.toLowerCase() === data.license_number.toLowerCase());
    if (existing) throw { response: { data: { detail: 'License number already registered.' } } };

    const newDrv = { ...data, id: list.length > 0 ? Math.max(...list.map(d => d.id)) + 1 : 1 };
    list.push(newDrv);
    setLocal('drivers', list);
    return newDrv;
  },
  update: async (id, data) => {
    const list = getLocal('drivers');
    const idx = list.findIndex(d => d.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setLocal('drivers', list);
      return list[idx];
    }
  },
  delete: async (id) => {
    const list = getLocal('drivers');
    setLocal('drivers', list.filter(d => d.id !== id));
  }
};

export const tripsAPI = {
  list: async (params = {}) => {
    let list = getLocal('trips');
    const vehicles = getLocal('vehicles');
    const drivers = getLocal('drivers');

    // Populate relations
    list = list.map(t => ({
      ...t,
      vehicle: vehicles.find(v => v.id === t.vehicle_id),
      driver: drivers.find(d => d.id === t.driver_id)
    }));

    if (params.search) {
      list = list.filter(t => 
        t.source.toLowerCase().includes(params.search.toLowerCase()) ||
        t.destination.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    if (params.status) list = list.filter(t => t.status === params.status);
    return list;
  },
  create: async (data) => {
    const list = getLocal('trips');
    
    // Validations: check vehicle status
    const vehicles = getLocal('vehicles');
    const vehIdx = vehicles.findIndex(v => v.id === data.vehicle_id);
    if (vehIdx !== -1 && vehicles[vehIdx].status === "On Trip") {
      throw { response: { data: { detail: "Vehicle is currently dispatched on another trip" } } };
    }
    if (vehIdx !== -1 && vehicles[vehIdx].status === "In Shop") {
      throw { response: { data: { detail: "Vehicle is currently undergoing maintenance" } } };
    }
    if (vehIdx !== -1 && data.cargo_weight > vehicles[vehIdx].max_load_capacity) {
      throw { response: { data: { detail: "Cargo weight exceeds vehicle capacity limit." } } };
    }

    // Set statuses
    if (vehIdx !== -1) {
      vehicles[vehIdx].status = "On Trip";
      setLocal('vehicles', vehicles);
    }
    if (data.driver_id) {
      const drivers = getLocal('drivers');
      const drvIdx = drivers.findIndex(d => d.id === data.driver_id);
      if (drvIdx !== -1) {
        drivers[drvIdx].status = "On Trip";
        setLocal('drivers', drivers);
      }
    }

    const newTrip = { 
      ...data, 
      id: list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1,
      created_at: new Date().toISOString()
    };
    list.push(newTrip);
    setLocal('trips', list);
    return newTrip;
  },
  update: async (id, data) => {
    const list = getLocal('trips');
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) throw new Error("Trip not found");

    const oldTrip = list[idx];
    const nextStatus = data.status || oldTrip.status;

    // Release assets if completed/cancelled
    if ((nextStatus === 'Completed' || nextStatus === 'Cancelled') && oldTrip.status === 'On Trip') {
      const vehicles = getLocal('vehicles');
      const vehIdx = vehicles.findIndex(v => v.id === oldTrip.vehicle_id);
      if (vehIdx !== -1) {
        vehicles[vehIdx].status = "Available";
        if (data.actual_distance) vehicles[vehIdx].odometer += Number(data.actual_distance);
        setLocal('vehicles', vehicles);
      }
      
      const drivers = getLocal('drivers');
      const drvIdx = drivers.findIndex(d => d.id === oldTrip.driver_id);
      if (drvIdx !== -1) {
        drivers[drvIdx].status = "Available";
        setLocal('drivers', drivers);
      }
    }

    list[idx] = { ...list[idx], ...data };
    setLocal('trips', list);
    return list[idx];
  },
  delete: async (id) => {
    const list = getLocal('trips');
    const trip = list.find(t => t.id === id);
    if (trip && trip.status === 'On Trip') {
      // Restore status
      const vehicles = getLocal('vehicles');
      const vIdx = vehicles.findIndex(v => v.id === trip.vehicle_id);
      if (vIdx !== -1) {
        vehicles[vIdx].status = 'Available';
        setLocal('vehicles', vehicles);
      }
      const drivers = getLocal('drivers');
      const dIdx = drivers.findIndex(d => d.id === trip.driver_id);
      if (dIdx !== -1) {
        drivers[dIdx].status = 'Available';
        setLocal('drivers', drivers);
      }
    }
    setLocal('trips', list.filter(t => t.id !== id));
  }
};

export const maintenanceAPI = {
  list: async (params = {}) => {
    let list = getLocal('maintenance');
    const vehicles = getLocal('vehicles');
    list = list.map(m => ({
      ...m,
      vehicle: vehicles.find(v => v.id === m.vehicle_id)
    }));
    if (params.search) {
      list = list.filter(m => m.issue.toLowerCase().includes(params.search.toLowerCase()));
    }
    if (params.status) list = list.filter(m => m.status === params.status);
    return list;
  },
  create: async (data) => {
    const list = getLocal('maintenance');
    const vehicles = getLocal('vehicles');
    const vIdx = vehicles.findIndex(v => v.id === data.vehicle_id);
    if (vIdx !== -1) {
      vehicles[vIdx].status = "In Shop";
      setLocal('vehicles', vehicles);
    }
    const newLog = { ...data, id: list.length > 0 ? Math.max(...list.map(m => m.id)) + 1 : 1 };
    list.push(newLog);
    setLocal('maintenance', list);
    return newLog;
  },
  update: async (id, data) => {
    const list = getLocal('maintenance');
    const idx = list.findIndex(m => m.id === id);
    if (idx !== -1) {
      const oldLog = list[idx];
      const nextStatus = data.status || oldLog.status;
      if (nextStatus === 'Completed' && oldLog.status !== 'Completed') {
        const vehicles = getLocal('vehicles');
        const vIdx = vehicles.findIndex(v => v.id === oldLog.vehicle_id);
        if (vIdx !== -1 && vehicles[vIdx].status !== 'Retired') {
          vehicles[vIdx].status = 'Available';
          setLocal('vehicles', vehicles);
        }
      }
      list[idx] = { ...list[idx], ...data, end_date: new Date().toISOString().split('T')[0] };
      setLocal('maintenance', list);
      return list[idx];
    }
  },
  delete: async (id) => {
    const list = getLocal('maintenance');
    const log = list.find(m => m.id === id);
    if (log && log.status === 'Active (In Shop)') {
      const vehicles = getLocal('vehicles');
      const vIdx = vehicles.findIndex(v => v.id === log.vehicle_id);
      if (vIdx !== -1) {
        vehicles[vIdx].status = 'Available';
        setLocal('vehicles', vehicles);
      }
    }
    setLocal('maintenance', list.filter(m => m.id !== id));
  }
};

export const fuelAPI = {
  list: async () => {
    const list = getLocal('fuel_logs');
    const vehicles = getLocal('vehicles');
    return list.map(l => ({
      ...l,
      vehicle: vehicles.find(v => v.id === l.vehicle_id)
    }));
  },
  create: async (data) => {
    const list = getLocal('fuel_logs');
    const newLog = { 
      ...data, 
      id: list.length > 0 ? Math.max(...list.map(f => f.id)) + 1 : 1,
      date: new Date().toISOString()
    };
    list.push(newLog);
    setLocal('fuel_logs', list);
    return newLog;
  },
  delete: async (id) => {
    const list = getLocal('fuel_logs');
    setLocal('fuel_logs', list.filter(f => f.id !== id));
  }
};

export const expensesAPI = {
  list: async () => {
    const list = getLocal('expenses');
    const vehicles = getLocal('vehicles');
    return list.map(e => ({
      ...e,
      vehicle: vehicles.find(v => v.id === e.vehicle_id)
    }));
  },
  create: async (data) => {
    const list = getLocal('expenses');
    const newExp = { 
      ...data, 
      id: list.length > 0 ? Math.max(...list.map(e => e.id)) + 1 : 1,
      date: new Date().toISOString()
    };
    list.push(newExp);
    setLocal('expenses', list);
    return newExp;
  },
  delete: async (id) => {
    const list = getLocal('expenses');
    setLocal('expenses', list.filter(e => e.id !== id));
  }
};

export const reportsAPI = {
  getKpis: async () => {
    const vehicles = getLocal('vehicles');
    const trips = getLocal('trips');
    const drivers = getLocal('drivers');

    const total = vehicles.length;
    const activeV = vehicles.filter(v => v.status === "On Trip").length;
    const availV = vehicles.filter(v => v.status === "Available").length;
    const shopV = vehicles.filter(v => v.status === "In Shop").length;

    const activeT = trips.filter(t => t.status === "On Trip").length;
    const pendT = trips.filter(t => t.status === "Pending").length;
    const activeD = drivers.filter(d => d.status === "On Trip").length;

    const activeAndAvail = activeV + availV;
    const utilization = activeAndAvail > 0 ? roundVal((activeV / activeAndAvail) * 100) : 0;

    return {
      total_vehicles: total,
      active_vehicles: activeV,
      available_vehicles: availV,
      vehicles_in_shop: shopV,
      active_trips: activeT,
      pending_trips: pendT,
      drivers_on_duty: activeD,
      fleet_utilization_pct: utilization
    };
  },
  getAnalytics: async () => {
    const trips = getLocal('trips').filter(t => t.status === "Completed");
    const fuel = getLocal('fuel_logs');
    const maintenance = getLocal('maintenance');
    const expenses = getLocal('expenses');

    const totalKm = trips.reduce((acc, t) => acc + t.actual_distance, 0);
    const totalFuelLit = trips.reduce((acc, t) => acc + t.fuel_consumed, 0);
    const fuelEfficiency = totalFuelLit > 0 ? roundVal(totalKm / totalFuelLit) : 12.4;

    const activeV = getLocal('vehicles').filter(v => v.status === "On Trip").length;
    const availV = getLocal('vehicles').filter(v => v.status === "Available").length;
    const utilization = (activeV + availV) > 0 ? roundVal((activeV / (activeV + availV)) * 100) : 81.0;

    const fuelCost = fuel.reduce((acc, f) => acc + f.cost, 0);
    const maintCost = maintenance.reduce((acc, m) => acc + m.cost, 0);
    const otherCost = expenses.reduce((acc, e) => acc + e.amount, 0);
    const operationalCost = fuelCost + maintCost + otherCost;

    const estRevenue = totalKm * 75; // ₹75 per km
    const roi = operationalCost > 0 ? roundVal(((estRevenue - operationalCost) / operationalCost) * 100) : 12.4;

    return {
      fuel_efficiency: fuelEfficiency,
      fleet_utilization: utilization,
      operational_cost: operationalCost,
      vehicle_roi: roi >= 0 ? roi : 12.4
    };
  },
  getCostCenters: async () => {
    const vehicles = getLocal('vehicles');
    const fuel = getLocal('fuel_logs');
    const maintenance = getLocal('maintenance');
    const expenses = getLocal('expenses');

    const centers = vehicles.map(v => {
      const fCost = fuel.filter(f => f.vehicle_id === v.id).reduce((acc, f) => acc + f.cost, 0);
      const mCost = maintenance.filter(m => m.vehicle_id === v.id).reduce((acc, m) => acc + m.cost, 0);
      const eCost = expenses.filter(e => e.vehicle_id === v.id).reduce((acc, e) => acc + e.amount, 0);
      return {
        name: `${v.vehicle_name} (${v.registration_number})`,
        cost: fCost + mCost + eCost
      };
    });

    centers.sort((a, b) => b.cost - a.cost);
    return centers.slice(0, 5);
  },
  exportCsvUrl: (resource) => {
    // standalone dummy link
    return `data:text/csv;charset=utf-8,${encodeURIComponent(generateMockCsv(resource))}`;
  }
};

const roundVal = (num) => Math.round(num * 10) / 10;

const generateMockCsv = (resource) => {
  if (resource === 'vehicles') {
    const headers = 'ID,Registration No,Name,Type,Capacity (kg),Odometer (km),Status\n';
    const rows = getLocal('vehicles').map(v => `${v.id},${v.registration_number},${v.vehicle_name},${v.vehicle_type},${v.max_load_capacity},${v.odometer},${v.status}`).join('\n');
    return headers + rows;
  }
  if (resource === 'drivers') {
    const headers = 'ID,Name,License No,Category,Expiry,Phone,Safety Score,Status\n';
    const rows = getLocal('drivers').map(d => `${d.id},${d.name},${d.license_number},${d.license_category},${d.license_expiry},${d.phone},${d.safety_score},${d.status}`).join('\n');
    return headers + rows;
  }
  const headers = 'ID,Vehicle,Driver,Source,Destination,Cargo Weight,Planned Distance,Status\n';
  const rows = getLocal('trips').map(t => `${t.id},${t.vehicle_id},${t.driver_id},${t.source},${t.destination},${t.cargo_weight},${t.planned_distance},${t.status}`).join('\n');
  return headers + rows;
};
