import { ReservationDashboard } from "@/components/ReservationDashboard";
import { ProductClassification } from "@/components/ProductClassification";

export default function DashboardPage() {
  return <div className="space-y-6"><ReservationDashboard /><ProductClassification /></div>;
}
