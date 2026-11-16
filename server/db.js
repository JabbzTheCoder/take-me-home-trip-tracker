// Database Adapter - Dynamic MongoDB integration with Jabbz, Tebza, Fresh, and Polo, Fiesta, i20
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Car } from './models/Car.js';
import { Trip } from './models/Trip.js';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CARS_FILE = path.join(DATA_DIR, 'cars.json');
const TRIPS_FILE = path.join(DATA_DIR, 'trips.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadFile(filePath, defaultData) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.warn(`Error reading ${filePath}:`, e.message);
  }
  saveFile(filePath, defaultData);
  return defaultData;
}

function saveFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error saving ${filePath}:`, e.message);
  }
}

// Initial seed drivers: Jabbz, Tebza, Fresh with admin powers and mandatory first-login password change
async function getInitialDrivers() {
  const salt = await bcrypt.genSalt(10);
  return [
    {
      _id: 'usr-jabbz-01',
      name: 'Jabbz',
      email: 'jabbz@tmh-fleet.co.za',
      password: await bcrypt.hash('Jabbz@TMH2026!', salt),
      role: 'Admin Chauffeur',
      isAdmin: true,
      mustChangePassword: true, // Required to change password upon first login
      phone: '+27 82 450 1198',
      avatarColor: '#38bdf8',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'usr-tebza-02',
      name: 'Tebza',
      email: 'tebza@tmh-fleet.co.za',
      password: await bcrypt.hash('Tebza@TMH2026!', salt),
      role: 'Admin Chauffeur',
      isAdmin: true,
      mustChangePassword: true,
      phone: '+27 73 892 4431',
      avatarColor: '#f59e0b',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'usr-fresh-03',
      name: 'Fresh',
      email: 'fresh@tmh-fleet.co.za',
      password: await bcrypt.hash('Fresh@TMH2026!', salt),
      role: 'Admin Chauffeur',
      isAdmin: true,
      mustChangePassword: true,
      phone: '+27 84 551 7732',
      avatarColor: '#10b981',
      createdAt: new Date().toISOString()
    }
  ];
}

// Initial seed cars: Polo, Fiesta, i20
const INITIAL_CARS = [
  {
    _id: 'car-polo-01',
    name: 'VW Polo',
    model: 'Polo 1.0 TSI',
    plate: 'GP 884-POL',
    color: 'Pure White',
    status: 'active',
    fuelPercent: 90,
    odometerKm: 34200,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'car-fiesta-02',
    name: 'Ford Fiesta',
    model: 'Fiesta EcoBoost',
    plate: 'GP 419-FIE',
    color: 'Deep Metallic Blue',
    status: 'active',
    fuelPercent: 75,
    odometerKm: 48500,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'car-i20-03',
    name: 'Hyundai i20',
    model: 'i20 1.2 Motion',
    plate: 'GP 302-I20',
    color: 'Silver Grey',
    status: 'active',
    fuelPercent: 80,
    odometerKm: 29800,
    createdAt: new Date().toISOString()
  }
];

// Initial dynamic trips using Jabbz, Tebza, Fresh, Polo, Fiesta, i20
const INITIAL_TRIPS = [
  {
    _id: 'trp-201',
    type: 'take_me_home',
    clientName: 'Dr. Michael Ndlovu',
    clientPhone: '+27 83 291 0041',
    clientCar: 'Audi Q7 3.0 TDI (Automatic)',
    pickup: 'The Grillhouse, Rosebank Mall',
    dropoff: '42 Cumberland Ave, Bryanston',
    clientDriverName: 'Jabbz',
    chaseDriverName: 'Tebza',
    chaseCar: 'VW Polo (GP 884-POL)',
    fare: 450,
    status: 'completed',
    notes: 'Client vehicle safely parked in garage. Handed keys to security at entrance. Escort car followed all the way.',
    date: '2026-11-16',
    time: '01:15',
    createdAt: new Date('2026-11-16T01:15:00Z').toISOString()
  },
  {
    _id: 'trp-202',
    type: 'take_me_home',
    clientName: 'Sarah Jenkins',
    clientPhone: '+27 82 774 1928',
    clientCar: 'BMW X3 (Automatic)',
    pickup: 'Tiger’s Milk, Cedar Square, Fourways',
    dropoff: '15 Silver Pine Ave, Randburg',
    clientDriverName: 'Tebza',
    chaseDriverName: 'Fresh',
    chaseCar: 'Ford Fiesta (GP 419-FIE)',
    fare: 410,
    status: 'completed',
    notes: 'Took N1 South highway. Gate access code #4192 provided by client. Smooth trip.',
    date: '2026-11-15',
    time: '23:40',
    createdAt: new Date('2026-11-15T23:40:00Z').toISOString()
  },
  {
    _id: 'trp-203',
    type: 'chauffeur',
    clientName: 'Advocate Maluleke',
    clientPhone: '+27 82 990 4112',
    clientCar: '',
    pickup: 'The Saxon Hotel, Sandhurst',
    dropoff: 'Steyn City Equestrian Estate',
    driverName: 'Fresh',
    car: 'Hyundai i20 (GP 302-I20)',
    fare: 550,
    status: 'completed',
    notes: 'VIP private client chauffeur transfer. In-car AC kept at 21 degrees as requested.',
    date: '2026-11-15',
    time: '21:00',
    createdAt: new Date('2026-11-15T21:00:00Z').toISOString()
  },
  {
    _id: 'trp-204',
    type: 'take_me_home',
    clientName: 'Kagiso Molefe',
    clientPhone: '+27 82 120 4492',
    clientCar: 'Range Rover Velar',
    pickup: 'Saint Restaurant, Sandton',
    dropoff: 'Dainfern Golf Estate, Fourways',
    clientDriverName: 'Jabbz',
    chaseDriverName: 'Fresh',
    chaseCar: 'VW Polo (GP 884-POL)',
    fare: 480,
    status: 'in_progress',
    notes: 'Currently in transit on William Nicol / Winnie Mandela Dr. Escort vehicle following closely.',
    date: '2026-11-16',
    time: '02:30',
    createdAt: new Date('2026-11-16T02:30:00Z').toISOString()
  }
];

export async function initDb() {
  const users = loadFile(USERS_FILE, null);
  if (!users || users.length === 0 || !users.some(u => u.name === 'Jabbz')) {
    const seedUsers = await getInitialDrivers();
    saveFile(USERS_FILE, seedUsers);
  }

  const cars = loadFile(CARS_FILE, null);
  if (!cars || cars.length === 0 || !cars.some(c => c.name === 'VW Polo')) {
    saveFile(CARS_FILE, INITIAL_CARS);
  }

  const trips = loadFile(TRIPS_FILE, null);
  if (!trips || trips.length === 0 || !trips.some(t => t.clientDriverName === 'Jabbz')) {
    saveFile(TRIPS_FILE, INITIAL_TRIPS);
  }

  // Also sync to MongoDB if connected
  if (dbService.isMongoActive()) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        const seedUsers = await getInitialDrivers();
        for (const u of seedUsers) {
          await User.create(u);
        }
      }
      const carCount = await Car.countDocuments();
      if (carCount === 0) {
        for (const c of INITIAL_CARS) {
          await Car.create(c);
        }
      }
      const tripCount = await Trip.countDocuments();
      if (tripCount === 0) {
        for (const t of INITIAL_TRIPS) {
          await Trip.create(t);
        }
      }
    } catch (e) {
      console.warn('MongoDB sync notice:', e.message);
    }
  }
}

export const dbService = {
  isMongoActive() {
    return mongoose.connection.readyState === 1;
  },

  // USERS / DRIVERS
  async findUserByEmail(email) {
    if (this.isMongoActive()) {
      return await User.findOne({ email: email.toLowerCase().trim() });
    }
    const users = loadFile(USERS_FILE, []);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  },

  async findUserById(id) {
    if (this.isMongoActive()) {
      return await User.findById(id);
    }
    const users = loadFile(USERS_FILE, []);
    return users.find(u => String(u._id) === String(id));
  },

  async createUser(userData) {
    if (this.isMongoActive()) {
      return await User.create(userData);
    }
    const users = loadFile(USERS_FILE, []);
    const newUser = {
      _id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isAdmin: true,
      mustChangePassword: true,
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveFile(USERS_FILE, users);
    return newUser;
  },

  async updateUserPassword(id, hashedPassword) {
    if (this.isMongoActive()) {
      return await User.findByIdAndUpdate(
        id,
        { password: hashedPassword, mustChangePassword: false },
        { new: true }
      );
    }
    const users = loadFile(USERS_FILE, []);
    const idx = users.findIndex(u => String(u._id) === String(id));
    if (idx !== -1) {
      users[idx].password = hashedPassword;
      users[idx].mustChangePassword = false;
      saveFile(USERS_FILE, users);
      return users[idx];
    }
    return null;
  },

  async updateUserProfile(id, updates) {
    const allowed = ['name', 'email', 'phone', 'avatarColor', 'profilePic'];
    const filtered = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }
    if (this.isMongoActive()) {
      return await User.findByIdAndUpdate(id, { $set: filtered }, { new: true });
    }
    const users = loadFile(USERS_FILE, []);
    const idx = users.findIndex(u => String(u._id) === String(id));
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...filtered };
      saveFile(USERS_FILE, users);
      return users[idx];
    }
    return null;
  },

  async getAllBrothers() {
    if (this.isMongoActive()) {
      return await User.find({}, '_id name email role isAdmin mustChangePassword phone avatarColor profilePic');
    }
    const users = loadFile(USERS_FILE, []);
    return users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isAdmin: true,
      mustChangePassword: !!u.mustChangePassword,
      phone: u.phone,
      avatarColor: u.avatarColor,
      profilePic: u.profilePic || ''
    }));
  },

  // CARS (DYNAMIC FLEET)
  async getCars() {
    if (this.isMongoActive()) {
      return await Car.find().sort({ createdAt: -1 });
    }
    return loadFile(CARS_FILE, INITIAL_CARS);
  },

  async createCar(carData) {
    if (this.isMongoActive()) {
      return await Car.create(carData);
    }
    const cars = loadFile(CARS_FILE, []);
    const newCar = {
      _id: `car-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'active',
      fuelPercent: 85,
      odometerKm: 35000,
      ...carData,
      createdAt: new Date().toISOString()
    };
    cars.push(newCar);
    saveFile(CARS_FILE, cars);
    return newCar;
  },

  async updateCar(id, carData) {
    if (this.isMongoActive()) {
      return await Car.findByIdAndUpdate(id, carData, { new: true });
    }
    const cars = loadFile(CARS_FILE, []);
    const idx = cars.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      cars[idx] = { ...cars[idx], ...carData };
      saveFile(CARS_FILE, cars);
      return cars[idx];
    }
    return null;
  },

  async deleteCar(id) {
    if (this.isMongoActive()) {
      return await Car.findByIdAndDelete(id);
    }
    let cars = loadFile(CARS_FILE, []);
    cars = cars.filter(c => String(c._id) !== String(id));
    saveFile(CARS_FILE, cars);
    return true;
  },

  // TRIPS
  async getTrips() {
    if (this.isMongoActive()) {
      return await Trip.find().sort({ createdAt: -1 });
    }
    const trips = loadFile(TRIPS_FILE, []);
    return trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async createTrip(tripData) {
    if (this.isMongoActive()) {
      return await Trip.create(tripData);
    }
    const trips = loadFile(TRIPS_FILE, []);
    const newTrip = {
      _id: `trp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...tripData,
      createdAt: new Date().toISOString()
    };
    trips.unshift(newTrip);
    saveFile(TRIPS_FILE, trips);
    return newTrip;
  },

  async updateTrip(id, updates) {
    if (this.isMongoActive()) {
      return await Trip.findByIdAndUpdate(id, updates, { new: true });
    }
    const trips = loadFile(TRIPS_FILE, []);
    const index = trips.findIndex(t => String(t._id) === String(id));
    if (index === -1) return null;
    trips[index] = { ...trips[index], ...updates };
    saveFile(TRIPS_FILE, trips);
    return trips[index];
  },

  async deleteTrip(id) {
    if (this.isMongoActive()) {
      return await Trip.findByIdAndDelete(id);
    }
    let trips = loadFile(TRIPS_FILE, []);
    trips = trips.filter(t => String(t._id) !== String(id));
    saveFile(TRIPS_FILE, trips);
    return true;
  }
};
