import { redirect } from "next/navigation";

export default function PaymentsLandingPage() {
    redirect("/dashboard/payments/history");
}
