export const initialVehicles = [
  { id: 1, registration_number: 'MH-12-GQ-4521', vehicle_name: 'Tata Prima 5530.S', vehicle_type: 'Semi', max_load_capacity: 40000.0, odometer: 45820.0, acquisition_cost: 4500000.0, status: 'Available' },
  { id: 2, registration_number: 'KA-03-AB-8819', vehicle_name: 'Ashok Leyland 1920', vehicle_type: 'Truck', max_load_capacity: 18000.0, odometer: 98100.0, acquisition_cost: 2800000.0, status: 'On Trip' },
  { id: 3, registration_number: 'DL-01-XY-3304', vehicle_name: 'BharatBenz 1217C', vehicle_type: 'Box Truck', max_load_capacity: 8000.0, odometer: 12450.0, acquisition_cost: 1850000.0, status: 'In Shop' },
  { id: 4, registration_number: 'TN-09-KL-5561', vehicle_name: 'Tata Ultra T.16', vehicle_type: 'Box Truck', max_load_capacity: 10000.0, odometer: 245600.0, acquisition_cost: 2100000.0, status: 'Retired' },
  { id: 5, registration_number: 'GJ-05-AB-7742', vehicle_name: 'Tata Winger Cargo', vehicle_type: 'Van', max_load_capacity: 2000.0, odometer: 5200.0, acquisition_cost: 1100000.0, status: 'Available' },
  { id: 6, registration_number: 'MH-12-XY-9901', vehicle_name: 'Mahindra Blazo X 55', vehicle_type: 'Semi', max_load_capacity: 42000.0, odometer: 112000.0, acquisition_cost: 4800000.0, status: 'Available' },
  { id: 7, registration_number: 'KA-03-GQ-1120', vehicle_name: 'Eicher Pro 3019', vehicle_type: 'Box Truck', max_load_capacity: 9000.0, odometer: 78500.0, acquisition_cost: 1950000.0, status: 'On Trip' },
  { id: 8, registration_number: 'DL-01-AB-4452', vehicle_name: 'Force Traveller Winger', vehicle_type: 'Van', max_load_capacity: 2500.0, odometer: 34500.0, acquisition_cost: 1350000.0, status: 'Available' },
  { id: 9, registration_number: 'TN-09-XY-8871', vehicle_name: 'Ashok Leyland 5525', vehicle_type: 'Semi', max_load_capacity: 40000.0, odometer: 154000.0, acquisition_cost: 4300000.0, status: 'Available' },
  { id: 10, registration_number: 'GJ-05-KL-2231', vehicle_name: 'BharatBenz 1917R', vehicle_type: 'Truck', max_load_capacity: 19000.0, odometer: 63200.0, acquisition_cost: 2950000.0, status: 'In Shop' }
];

export const initialDrivers = [
  { id: 1, name: 'Rajesh Kumar', license_number: 'DL-99482-TN', license_category: 'HMV', license_expiry: '2028-11-15', phone: '+91-98765-43210', safety_score: 98.0, status: 'Available' },
  { id: 2, name: 'Vikram Singh', license_number: 'DL-11029-KA', license_category: 'HMV', license_expiry: '2027-05-22', phone: '+91-99887-76655', safety_score: 85.0, status: 'On Trip' },
  { id: 3, name: 'Amit Sharma', license_number: 'DL-44810-NY', license_category: 'LMV', license_expiry: '2029-12-01', phone: '+91-95544-33221', safety_score: 92.0, status: 'Available' },
  { id: 4, name: 'Sanjay Patel', license_number: 'DL-22391-FL', license_category: 'HMV', license_expiry: '2026-08-10', phone: '+91-92211-00998', safety_score: 74.0, status: 'Suspended' },
  { id: 5, name: 'Rohan Reddy', license_number: 'DL-55441-AP', license_category: 'HMV', license_expiry: '2027-09-18', phone: '+91-94433-22110', safety_score: 89.0, status: 'On Trip' },
  { id: 6, name: 'Sunil Verma', license_number: 'DL-66772-MH', license_category: 'LMV', license_expiry: '2028-02-14', phone: '+91-93322-11004', safety_score: 94.0, status: 'Available' },
  { id: 7, name: 'Vijay Nair', license_number: 'DL-88991-KL', license_category: 'HMV', license_expiry: '2029-06-30', phone: '+91-96655-44332', safety_score: 91.0, status: 'Available' },
  { id: 8, name: 'Anil Gowda', license_number: 'DL-33442-KA', license_category: 'HMV', license_expiry: '2026-03-25', phone: '+91-97766-55443', safety_score: 82.0, status: 'Off Duty' }
];

export const initialTrips = [
  { id: 1, vehicle_id: 2, driver_id: 2, source: 'Mumbai Depot', destination: 'Pune Hub', cargo_weight: 12000.0, planned_distance: 150.0, actual_distance: 0.0, fuel_consumed: 0.0, status: 'On Trip', created_at: '2026-07-10T08:30:00Z' },
  { id: 2, vehicle_id: 7, driver_id: 5, source: 'Bengaluru Depot', destination: 'Chennai Hub', cargo_weight: 8500.0, planned_distance: 350.0, actual_distance: 0.0, fuel_consumed: 0.0, status: 'On Trip', created_at: '2026-07-11T10:15:00Z' },
  { id: 3, vehicle_id: 5, driver_id: 1, source: 'Delhi Depot', destination: 'Jaipur Hub', cargo_weight: 1800.0, planned_distance: 270.0, actual_distance: 270.0, fuel_consumed: 62.0, status: 'Completed', created_at: '2026-07-09T06:00:00Z' },
  { id: 4, vehicle_id: 1, driver_id: 3, source: 'Hyderabad Depot', destination: 'Vijayawada Hub', cargo_weight: 15000.0, planned_distance: 275.0, actual_distance: 275.0, fuel_consumed: 74.0, status: 'Completed', created_at: '2026-07-08T09:00:00Z' }
];

export const initialMaintenance = [
  { id: 1, vehicle_id: 3, issue: 'Engine Overheating', description: 'Gasket leak repair and radiator tuning.', cost: 15430.0, status: 'Active (In Shop)', start_date: '2026-07-10', end_date: null },
  { id: 2, vehicle_id: 10, issue: 'Brake Pad Replacement', description: 'Replaced front calipers and brake discs.', cost: 8500.0, status: 'Active (In Shop)', start_date: '2026-07-11', end_date: null },
  { id: 3, vehicle_id: 6, issue: 'Oil Change & Filters', description: 'Engine oil flush and air filters replacement.', cost: 4200.0, status: 'Completed', start_date: '2026-07-05', end_date: '2026-07-06' }
];

export const initialFuelLogs = [
  { id: 1, vehicle_id: 1, liters: 120.0, cost: 10800.0, date: '2026-07-11T14:30:00Z' },
  { id: 2, vehicle_id: 5, liters: 45.0, cost: 4050.0, date: '2026-07-10T16:15:00Z' },
  { id: 3, vehicle_id: 6, liters: 290.0, cost: 26100.0, date: '2026-07-08T11:20:00Z' }
];

export const initialExpenses = [
  { id: 1, vehicle_id: 1, type: 'Toll', amount: 1500.0, description: 'Mumbai-Pune Expressway toll fee.', date: '2026-07-11T14:35:00Z' },
  { id: 2, vehicle_id: 2, type: 'Permit', amount: 8000.0, description: 'National permit renew fee.', date: '2026-07-05T09:00:00Z' },
  { id: 3, vehicle_id: 5, type: 'Insurance', amount: 15000.0, description: 'Annual commercial vehicle cover.', date: '2026-07-01T10:00:00Z' }
];
