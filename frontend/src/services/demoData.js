// Demo data service for GitHub Pages deployment
// This provides mock data when the backend is not available

export const demoFacilities = [
  {
    id: 1,
    name: "Main Building",
    address: "123 Main Street, City",
    type: "Office",
    status: "active",
    created_at: "2023-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    name: "Bike Market",
    address: "456 Market Avenue, City",
    type: "Commercial",
    status: "active",
    created_at: "2023-02-20T14:30:00Z",
    updated_at: "2024-01-20T14:30:00Z"
  }
];

export const demoMeters = [
  {
    id: 1,
    facility_id: 1,
    facility_name: "Main Building",
    serial_number: "ELE001",
    type: "electric",
    location: "Main Panel",
    manufacturer: "Siemens",
    model: "PAC3200",
    installation_date: "2023-01-15",
    status: "active"
  },
  {
    id: 2,
    facility_id: 1,
    facility_name: "Main Building",
    serial_number: "GAS001",
    type: "gas",
    location: "Basement",
    manufacturer: "Honeywell",
    model: "EK280",
    installation_date: "2023-01-20",
    status: "active"
  },
  {
    id: 3,
    facility_id: 2,
    facility_name: "Bike Market",
    serial_number: "ELE002",
    type: "electric",
    location: "Shop Floor",
    manufacturer: "ABB",
    model: "M2M",
    installation_date: "2023-02-10",
    status: "active"
  }
];

export const demoHeatingMeters = [
  {
    id: 4,
    facility_id: 1,
    facility_name: "Main Building",
    serial_number: "HEAT001",
    location: "Boiler Room",
    manufacturer: "Viessmann",
    status: "active",
    source_table: "heating_systems"
  },
  {
    id: 5,
    facility_id: 2,
    facility_name: "Bike Market",
    serial_number: "HEAT002",
    location: "Utility Room",
    manufacturer: "Buderus",
    status: "active",
    source_table: "heating_systems"
  }
];

export const demoReadings = [
  {
    id: 1,
    meter_id: 1,
    reading_value: 1250.5,
    reading_date: "2024-01-15",
    notes: "Monthly reading"
  },
  {
    id: 2,
    meter_id: 1,
    reading_value: 1275.8,
    reading_date: "2024-01-20",
    notes: "Weekly check"
  },
  {
    id: 3,
    meter_id: 2,
    reading_value: 850.2,
    reading_date: "2024-01-15",
    notes: "Monthly reading"
  },
  {
    id: 4,
    meter_id: 3,
    reading_value: 420.7,
    reading_date: "2024-01-18",
    notes: "Bi-weekly check"
  }
];

export const demoDashboardData = {
  totalFacilities: 2,
  totalMeters: 5,
  totalReadings: 87,
  activeAlerts: 0,
  recentReadings: demoReadings.slice(-5),
  energyConsumption: {
    electric: 2850.5,
    gas: 1250.8,
    heating: 980.3
  },
  monthlyTrends: [
    { month: "Jan", electric: 2800, gas: 1200, heating: 950 },
    { month: "Feb", electric: 2750, gas: 1180, heating: 920 },
    { month: "Mar", electric: 2900, gas: 1300, heating: 1000 }
  ]
};

// Demo API service that mimics the real API
export class DemoApiService {
  static async getFacilities() {
    await this.delay(300); // Simulate network delay
    return { data: demoFacilities };
  }

  static async getMeters() {
    await this.delay(300);
    return { data: demoMeters };
  }

  static async getHeating() {
    await this.delay(300);
    return { data: demoHeatingMeters };
  }

  static async getMeterReadings(meterId) {
    await this.delay(300);
    const readings = demoReadings.filter(r => r.meter_id === parseInt(meterId));
    return { data: readings };
  }

  static async getDashboard() {
    await this.delay(300);
    return { data: demoDashboardData };
  }

  static async getEnergyConsumption() {
    await this.delay(300);
    return { data: demoDashboardData.energyConsumption };
  }

  // Simulate network delay
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Mock methods for other API calls
  static async createFacility(data) {
    await this.delay(300);
    return { data: { id: Date.now(), ...data } };
  }

  static async updateFacility(id, data) {
    await this.delay(300);
    return { data: { id, ...data } };
  }

  static async deleteFacility(id) {
    await this.delay(300);
    return { data: { success: true } };
  }

  static async createMeter(data) {
    await this.delay(300);
    return { data: { id: Date.now(), ...data } };
  }

  static async updateMeter(id, data) {
    await this.delay(300);
    return { data: { id, ...data } };
  }

  static async deleteMeter(id) {
    await this.delay(300);
    return { data: { success: true } };
  }

  static async createReading(data) {
    await this.delay(300);
    return { data: { id: Date.now(), ...data } };
  }

  static async updateReading(id, data) {
    await this.delay(300);
    return { data: { id, ...data } };
  }

  static async deleteReading(id) {
    await this.delay(300);
    return { data: { success: true } };
  }
}

export default DemoApiService;