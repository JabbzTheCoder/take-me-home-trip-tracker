// Take Me Home Fleet - Simple State Management & Auth
// Two trip types:
// 1. 'take_me_home': Client driven home in their own car (2 Drivers: Client Car Driver + Chase Car Driver)
// 2. 'chauffeur': Standard chauffeur ride in fleet car (1 Driver)

const STORAGE_KEY = 'tmh_simple_fleet_v2';
const AUTH_KEY = 'tmh_current_user_v2';

const BROTHERS = [
  {
    id: 'driver-1',
    name: 'Kamogelo',
    fullName: 'Kamogelo Motlhale',
    role: 'Lead Chauffeur',
    pin: '1111',
    avatarColor: '#38bdf8'
  },
  {
    id: 'driver-2',
    name: 'Thabo',
    fullName: 'Thabo Motlhale',
    role: 'Chauffeur',
    pin: '2222',
    avatarColor: '#f59e0b'
  },
  {
    id: 'driver-3',
    name: 'Sipho',
    fullName: 'Sipho Motlhale',
    role: 'Chauffeur',
    pin: '3333',
    avatarColor: '#10b981'
  }
];

const CARS = [
  { id: 'car-1', name: 'Car 1 (Mercedes C200)', plate: 'GP 884-TMH' },
  { id: 'car-2', name: 'Car 2 (BMW 320i)', plate: 'GP 419-DRV' }
];

const INITIAL_TRIPS = [
  {
    id: 'TRP-101',
    type: 'take_me_home', // 2 Drivers needed
    clientName: 'Dr. Michael Ndlovu',
    clientPhone: '+27 83 291 0041',
    clientCar: 'Audi Q7 3.0 TDI (Automatic)',
    pickup: 'The Grillhouse, Rosebank Mall',
    dropoff: '42 Cumberland Ave, Bryanston',
    clientDriverId: 'driver-1', // Kamogelo drove client car
    chaseDriverId: 'driver-2',  // Thabo drove chase car
    chaseCarId: 'car-1',        // Mercedes C200 was the chase car
    fare: 450,
    status: 'completed',
    date: '2026-11-15',
    time: '23:15',
    notes: 'Escort car followed closely. Client car parked safely in garage.'
  },
  {
    id: 'TRP-102',
    type: 'take_me_home',
    clientName: 'Sarah Jenkins',
    clientPhone: '+27 82 774 1928',
    clientCar: 'BMW X3 (Automatic)',
    pickup: 'Tiger’s Milk, Cedar Square, Fourways',
    dropoff: '15 Silver Pine Ave, Randburg',
    clientDriverId: 'driver-2', // Thabo drove client car
    chaseDriverId: 'driver-3',  // Sipho drove chase car
    chaseCarId: 'car-2',        // BMW 320i chase car
    fare: 410,
    status: 'completed',
    date: '2026-11-15',
    time: '22:40',
    notes: 'Took N1 South. Smooth run.'
  },
  {
    id: 'TRP-103',
    type: 'chauffeur', // 1 Driver
    clientName: 'Advocate Maluleke',
    clientPhone: '+27 82 990 4112',
    clientCar: '',
    pickup: 'The Saxon Hotel, Sandhurst',
    dropoff: 'Steyn City Equestrian Estate',
    driverId: 'driver-3', // Sipho
    carId: 'car-1',
    fare: 550,
    status: 'completed',
    date: '2026-11-15',
    time: '21:00',
    notes: 'Executive VIP private transfer in Car 1.'
  },
  {
    id: 'TRP-104',
    type: 'take_me_home',
    clientName: 'Kagiso Molefe',
    clientPhone: '+27 82 120 4492',
    clientCar: 'Range Rover Velar',
    pickup: 'Saint Restaurant, Sandton',
    dropoff: 'Dainfern Golf Estate, Fourways',
    clientDriverId: 'driver-1', // Kamogelo
    chaseDriverId: 'driver-3',  // Sipho
    chaseCarId: 'car-2',
    fare: 480,
    status: 'in_progress',
    date: '2026-11-16',
    time: '01:45',
    notes: 'Currently in transit on William Nicol / Winnie Mandela Dr.'
  },
  {
    id: 'TRP-105',
    type: 'chauffeur',
    clientName: 'Leanne Botha',
    clientPhone: '+27 83 456 9901',
    clientCar: '',
    pickup: 'Menlyn Maine Central Square, Pretoria',
    dropoff: 'Waterkloof Ridge, Pretoria',
    driverId: 'driver-2', // Thabo
    carId: 'car-2',
    fare: 350,
    status: 'completed',
    date: '2026-11-14',
    time: '20:15',
    notes: 'Insurance chauffeur booking.'
  }
];

class SimpleStore {
  constructor() {
    this.trips = this.loadTrips();
    this.currentUser = this.loadAuth();
    this.listeners = [];
  }

  loadTrips() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed loading trips from storage', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_TRIPS));
  }

  saveTrips() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.trips));
    } catch (e) {
      console.error('Error saving trips', e);
    }
    this.notify();
  }

  loadAuth() {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const found = BROTHERS.find(b => b.id === stored);
        if (found) return found;
      }
    } catch (e) {
      console.warn('Failed loading auth', e);
    }
    return null; // Not logged in initially
  }

  loginWithPin(driverId, pin) {
    const brother = BROTHERS.find(b => b.id === driverId);
    if (!brother) return { success: false, message: 'Brother profile not found' };
    if (brother.pin !== pin) return { success: false, message: 'Incorrect PIN code' };

    this.currentUser = brother;
    localStorage.setItem(AUTH_KEY, brother.id);
    this.notify();
    return { success: true, brother };
  }

  quickLogin(driverId) {
    const brother = BROTHERS.find(b => b.id === driverId);
    if (brother) {
      this.currentUser = brother;
      localStorage.setItem(AUTH_KEY, brother.id);
      this.notify();
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(AUTH_KEY);
    this.notify();
  }

  addTrip(tripData) {
    const newId = `TRP-${100 + this.trips.length + 1}`;
    const newTrip = {
      id: newId,
      type: tripData.type || 'take_me_home',
      clientName: tripData.clientName || 'Private Client',
      clientPhone: tripData.clientPhone || '',
      clientCar: tripData.clientCar || '',
      pickup: tripData.pickup || '',
      dropoff: tripData.dropoff || '',
      clientDriverId: tripData.clientDriverId || null,
      chaseDriverId: tripData.chaseDriverId || null,
      chaseCarId: tripData.chaseCarId || 'car-1',
      driverId: tripData.driverId || null,
      carId: tripData.carId || 'car-1',
      fare: parseFloat(tripData.fare) || 350,
      status: tripData.status || 'in_progress',
      date: tripData.date || new Date().toISOString().split('T')[0],
      time: tripData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: tripData.notes || ''
    };

    this.trips.unshift(newTrip);
    this.saveTrips();
    return newTrip;
  }

  completeTrip(tripId) {
    const trip = this.trips.find(t => t.id === tripId);
    if (trip) {
      trip.status = 'completed';
      this.saveTrips();
    }
    return trip;
  }

  deleteTrip(tripId) {
    this.trips = this.trips.filter(t => t.id !== tripId);
    this.saveTrips();
  }

  getBrothers() {
    return BROTHERS;
  }

  getCars() {
    return CARS;
  }

  getBrother(id) {
    return BROTHERS.find(b => b.id === id);
  }

  getCar(id) {
    return CARS.find(c => c.id === id);
  }

  // Summary stats
  getStats() {
    const totalTrips = this.trips.length;
    const takeMeHomeCount = this.trips.filter(t => t.type === 'take_me_home').length;
    const chauffeurCount = this.trips.filter(t => t.type === 'chauffeur').length;
    const totalEarnings = this.trips.reduce((acc, t) => acc + (t.fare || 0), 0);

    return {
      totalTrips,
      takeMeHomeCount,
      chauffeurCount,
      totalEarnings
    };
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  reset() {
    this.trips = JSON.parse(JSON.stringify(INITIAL_TRIPS));
    this.saveTrips();
  }
}

export const simpleStore = new SimpleStore();
