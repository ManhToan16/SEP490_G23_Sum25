import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loading from "@/shared/components/common/LoadingSpinner";
import { ROUTES } from "@/shared/constants/routes";

// Lazy load patient pages
const Dashboard = React.lazy(() => import("@/pages/patient/Dashboard"));
const MyInfo = React.lazy(() => import("@/pages/patient/MyInfo"));
const MyMedicalRecords = React.lazy(
  () => import("@/pages/patient/MyMedicalRecords")
);
const MyAppointments = React.lazy(
  () => import("@/pages/patient/MyAppointments")
);
const BookAppointment = React.lazy(
  () => import("@/pages/patient/BookAppointment")
);
const DoctorReviewList = React.lazy(
  () => import("@/pages/patient/DoctorReviewList")
);
const SubmitReview = React.lazy(() => import("@/pages/patient/SubmitReview"));

const PatientRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="my-info" element={<MyInfo />} />
        <Route path="medical-records" element={<MyMedicalRecords />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="review-list" element={<DoctorReviewList />} />
        <Route path="submit-review/:appointmentId" element={<SubmitReview />} />
      </Routes>
    </Suspense>
  );
};

export default PatientRoutes;
