import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Car } from './models/Car.js';
import { Trip } from './models/Trip.js';
import { calculateTripSplits } from './splits.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tmh_tracker';
const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CARS_FILE = path.join(DATA_DIR, 'cars.json');
const TRIPS_FILE = path.join(DATA_DIR, 'trips.json');

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
      mustChangePassword: true,
      phone: '+27 82 450 1198',
      avatarColor: '#38bdf8',
      profilePic: '',
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
      profilePic: '',
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
      profilePic: '',
      createdAt: new Date().toISOString()
    }
  ];
}

const INITIAL_CARS = [
  {
    _id: 'car-polo-01',
    name: 'VW Polo Hatch',
    model: 'Polo TSI Comfortline',
    plate: 'GP 884-POL',
    color: 'Pure White',
    status: 'active',
    fuelPercent: 90,
    odometerKm: 42150,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'car-fiesta-02',
    name: 'Ford Fiesta',
    model: 'Fiesta 1.0 EcoBoost',
    plate: 'GP 419-FIE',
    color: 'Deep Impact Blue',
    status: 'active',
    fuelPercent: 65,
    odometerKm: 58400,
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
  }
];

// Global Mongoose Cache for Next.js
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let isInitialized = false;

export async function connectDb() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    }).then((mongooseInstance) => {
      console.log('Connected to MongoDB database.');
      return mongooseInstance;
    }).catch((err) => {
      console.warn('MongoDB not reachable, using persistent file database store:', err.message);
      return null;
    });
  }

  cached.conn = await cached.promise;

  if (!isInitialized) {
    await initDb();
    isInitialized = true;
  }

  return cached.conn;
}

export async function initDb() {
  const isMongo = mongoose.connection.readyState === 1;

  if (isMongo) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        const drivers = await getInitialDrivers();
        await User.insertMany(drivers);
        console.log('Seeded initial drivers into MongoDB.');
      }
      const carCount = await Car.countDocuments();
      if (carCount === 0) {
        await Car.insertMany(INITIAL_CARS);
        console.log('Seeded initial fleet cars into MongoDB.');
      }
      const tripCount = await Trip.countDocuments();
      if (tripCount === 0) {
        await Trip.insertMany(INITIAL_TRIPS);
        console.log('Seeded initial trips into MongoDB.');
      }
    } catch (e) {
      console.warn('Error seeding MongoDB:', e.message);
    }
  }

  // Ensure local files exist
  const existingUsers = loadFile(USERS_FILE, null);
  if (!existingUsers || existingUsers.length === 0) {
    const drivers = await getInitialDrivers();
    saveFile(USERS_FILE, drivers);
  }
  const existingCars = loadFile(CARS_FILE, null);
  if (!existingCars || existingCars.length === 0) {
    saveFile(CARS_FILE, INITIAL_CARS);
  }
  const existingTrips = loadFile(TRIPS_FILE, null);
  if (!existingTrips || existingTrips.length === 0) {
    saveFile(TRIPS_FILE, INITIAL_TRIPS);
  }
}

export const dbService = {
  isMongoActive() {
    return mongoose.connection.readyState === 1;
  },

  async getAllBrothers() {
    await connectDb();
    if (this.isMongoActive()) {
      return await User.find({}, '-password');
    }
    const users = loadFile(USERS_FILE, []);
    return users.map(({ password, ...u }) => u);
  },

  async findUserByEmail(email) {
    await connectDb();
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    if (this.isMongoActive()) {
      return await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
    }
    const users = loadFile(USERS_FILE, []);
    return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  async createUser({ name, email, phone, password, role = 'Driver', isAdmin = false, avatarColor = '#38bdf8' }) {
    await connectDb();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'driver123', salt);
    const cleanEmail = email.toLowerCase().trim();

    if (this.isMongoActive()) {
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : '',
        role,
        isAdmin,
        mustChangePassword: true,
        avatarColor,
        profilePic: ''
      });
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    }

    const users = loadFile(USERS_FILE, []);
    const newUser = {
      _id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role,
      isAdmin,
      mustChangePassword: true,
      avatarColor,
      profilePic: '',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveFile(USERS_FILE, users);
    const { password: pw, ...safe } = newUser;
    return safe;
  },

  async findUserById(id) {
    await connectDb();
    if (!id) return null;
    if (this.isMongoActive()) {
      return await User.findById(id).select('-password');
    }
    const users = loadFile(USERS_FILE, []);
    const found = users.find(u => String(u._id) === String(id));
    if (!found) return null;
    const { password, ...safeUser } = found;
    return safeUser;
  },

  async updateUserPassword(id, newPasswordHash) {
    await connectDb();
    if (this.isMongoActive()) {
      return await User.findByIdAndUpdate(id, {
        password: newPasswordHash,
        mustChangePassword: false
      }, { new: true });
    }
    const users = loadFile(USERS_FILE, []);
    const index = users.findIndex(u => String(u._id) === String(id));
    if (index === -1) return null;
    users[index].password = newPasswordHash;
    users[index].mustChangePassword = false;
    saveFile(USERS_FILE, users);
    const { password, ...safe } = users[index];
    return safe;
  },

  async updateUserProfile(id, updates) {
    await connectDb();
    const allowed = ['name', 'email', 'phone', 'avatarColor', 'profilePic'];
    const filtered = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }

    if (this.isMongoActive()) {
      return await User.findByIdAndUpdate(id, filtered, { new: true }).select('-password');
    }

    const users = loadFile(USERS_FILE, []);
    const index = users.findIndex(u => String(u._id) === String(id));
    if (index === -1) return null;
    users[index] = { ...users[index], ...filtered };
    saveFile(USERS_FILE, users);
    const { password, ...safe } = users[index];
    return safe;
  },

  // CARS
  async getCars() {
    await connectDb();
    if (this.isMongoActive()) {
      return await Car.find().sort({ createdAt: 1 });
    }
    return loadFile(CARS_FILE, []);
  },

  async createCar(carData) {
    await connectDb();
    if (this.isMongoActive()) {
      return await Car.create(carData);
    }
    const cars = loadFile(CARS_FILE, []);
    const newCar = {
      _id: `car-${Date.now()}`,
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
    await connectDb();
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
    await connectDb();
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
    await connectDb();
    if (this.isMongoActive()) {
      return await Trip.find().sort({ createdAt: -1 });
    }
    const trips = loadFile(TRIPS_FILE, []);
    return trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getTripById(id) {
    await connectDb();
    if (this.isMongoActive()) {
      return await Trip.findById(id);
    }
    const trips = loadFile(TRIPS_FILE, []);
    return trips.find(t => String(t._id) === String(id)) || null;
  },

  async createTrip(tripData) {
    await connectDb();
    const trips = loadFile(TRIPS_FILE, []);
    const invoiceNum = tripData.invoiceNumber || (370 + trips.length + 1).toString();

    // Default status is 'completed' (in_progress removed)
    const isCancelledOrPaused =
      tripData.status === 'deferred' ||
      tripData.status === 'cancelled' ||
      tripData.status === 'paused' ||
      tripData.status === 'cancelled_paused';
    const status = isCancelledOrPaused ? tripData.status : 'completed';
    const extraCosts = Array.isArray(tripData.extraCosts) ? tripData.extraCosts : [];

    const computed = calculateTripSplits({
      ...tripData,
      fare: tripData.fare,
      extraCosts,
      splits: tripData.splits
    });

    const dataWithInvoice = {
      ...tripData,
      status,
      invoiceNumber: invoiceNum,
      profile: tripData.profile || 'profile1',
      extraCosts,
      totalExtraCosts: computed.totalExtraCosts,
      netFare: computed.netFare,
      splits: tripData.splits || {
        splitType: computed.splitType,
        leadDriverAmount: computed.leadDriverShare,
        chaseDriverAmount: computed.chaseDriverShare,
        companyAmount: computed.companyShare,
        leadDriverPercent: 50,
        chaseDriverPercent: 50
      }
    };

    if (this.isMongoActive()) {
      return await Trip.create(dataWithInvoice);
    }
    const newTrip = {
      _id: `trp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...dataWithInvoice,
      createdAt: new Date().toISOString()
    };
    trips.unshift(newTrip);
    saveFile(TRIPS_FILE, trips);
    return newTrip;
  },

  async updateTrip(id, updates) {
    await connectDb();

    // Fetch existing trip to compute combined financial and split values
    let existing = null;
    if (this.isMongoActive()) {
      existing = await Trip.findById(id);
    } else {
      const trips = loadFile(TRIPS_FILE, []);
      existing = trips.find(t => String(t._id) === String(id));
    }

    if (!existing) return null;

    const merged = { ...(existing.toObject ? existing.toObject() : existing), ...updates };

    // Recompute extra costs and splits if fare, extraCosts, or splits were modified
    if (updates.fare !== undefined || updates.extraCosts !== undefined || updates.splits !== undefined) {
      const computed = calculateTripSplits(merged);
      updates.totalExtraCosts = computed.totalExtraCosts;
      updates.netFare = computed.netFare;
      if (!updates.splits || updates.splits.splitType === 'equal_50_50') {
        updates.splits = {
          ...(merged.splits || {}),
          splitType: computed.splitType,
          leadDriverAmount: computed.leadDriverShare,
          chaseDriverAmount: computed.chaseDriverShare,
          companyAmount: computed.companyShare
        };
      }
    }

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

  async deleteTrip(id, deferReason = 'Cancelled by driver') {
    // Audit Compliance: Hard deletion prohibited. Mark as deferred instead.
    return await this.updateTrip(id, {
      status: 'deferred',
      deferReason,
      deferredAt: new Date().toISOString()
    });
  }
};
