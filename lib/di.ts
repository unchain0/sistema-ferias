import {
  SupabaseProfessionalRepository,
  SupabaseUserRepository,
  SupabaseVacationRepository,
} from '@/repositories/supabase-repositories';
import { AuthService } from '@/services/auth-service';
import { DashboardService } from '@/services/dashboard-service';
import { ProfessionalService } from '@/services/professional-service';
import { VacationService } from '@/services/vacation-service';

export const userRepository = new SupabaseUserRepository();
export const professionalRepository = new SupabaseProfessionalRepository();
export const vacationRepository = new SupabaseVacationRepository();

export const dashboardService = new DashboardService(professionalRepository, vacationRepository);
export const authService = new AuthService(userRepository);
export const professionalService = new ProfessionalService(professionalRepository);
export const vacationService = new VacationService(vacationRepository, professionalRepository);
