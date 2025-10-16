// This file allows switching between filesystem/memory storage and Supabase
// Automatically detects which to use based on environment variables

const USE_SUPABASE = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Import from the appropriate module
import * as dbFileSystem from './db';
import * as dbSupabase from './db-supabase';

// Export the appropriate implementation
const db = USE_SUPABASE ? dbSupabase : dbFileSystem;

export const {
  getUsers,
  getUserByEmail,
  getUserById,
  createUser,
  getProfessionals,
  getProfessionalById,
  createProfessional,
  updateProfessional,
  deleteProfessional,
  getVacationPeriods,
  getVacationsByProfessional,
  createVacationPeriod,
  updateVacationPeriod,
  deleteVacationPeriod,
} = db;
