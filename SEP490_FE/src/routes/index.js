import ADMIN_ROUTES from './AdminRouter';
import DOCTOR_ROUTES from './DoctorRouter';
import PARACLINICAL_ROUTES from './Paraclinical';
import PATIENT_ROUTES from './PatientRouter';
import RECEPTIONIST_ROUTES from './Receptionist';

const ROUTES = {
  patient: PATIENT_ROUTES,
  doctor: DOCTOR_ROUTES,
  paraclinical: PARACLINICAL_ROUTES,
  admin: ADMIN_ROUTES,
  receptionist: RECEPTIONIST_ROUTES
};

export default ROUTES;