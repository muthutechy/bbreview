import { BusinessForm } from "@/components/BusinessForm";

export default function NewBusinessPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black">Add Business</h1>
      <BusinessForm />
    </main>
  );
}
