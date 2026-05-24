import { PreCheckInForm } from "@/components/PreCheckInForm";

export default async function PrecheckinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PreCheckInForm token={token} />;
}
