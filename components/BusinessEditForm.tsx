"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BusinessEditProps = {
  business: {
    id: string;
    name: string;
    category: string;
    address: string;
    city: string;
    phone: string;
    website?: string | null;
    reviewLink: string;
    tone: string;
    preferredLanguages: string[];
    services: { id: string; name: string }[];
    locations: { id: string; name: string }[];
  };
};

export function BusinessEditForm({ business }: BusinessEditProps) {
  const router = useRouter();
  const [services, setServices] = useState(business.services.map((s) => s.name));
  const [locations, setLocations] = useState(business.locations.map((l) => l.name));
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      category: form.get("category"),
      address: form.get("address"),
      city: form.get("city"),
      phone: form.get("phone"),
      website: form.get("website"),
      reviewLink: form.get("reviewLink"),
      tone: form.get("tone"),
      preferredLanguages: String(form.get("preferredLanguages") || "English").split(",").map(s => s.trim()).filter(Boolean),
      services: services.filter(Boolean),
      locations: locations.filter(Boolean),
    };

    const res = await fetch(`/api/business/${business.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setLoading(false);

    if (data.id) router.push(`/dashboard/business/${data.id}`);
    else alert(data.error || "Unable to update business");
  }

  async function deleteBusiness() {
    const ok = confirm(`Delete ${business.name}? This will remove its review links, analytics, and sessions.`);
    if (!ok) return;

    setDeleting(true);
    const res = await fetch(`/api/business/${business.id}`, { method: "DELETE" });
    const data = await res.json();
    setDeleting(false);

    if (data.success) router.push("/dashboard");
    else alert(data.error || "Unable to delete business");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="card space-y-4">
        <input name="name" className="input" placeholder="Business Name" defaultValue={business.name} required />
        <input name="category" className="input" placeholder="Category" defaultValue={business.category} required />
        <textarea name="address" className="input" placeholder="Address" defaultValue={business.address} required />
        <input name="city" className="input" placeholder="City / Service Areas" defaultValue={business.city} required />
        <input name="phone" className="input" placeholder="Phone Number" defaultValue={business.phone} required />
        <input name="website" className="input" placeholder="Website" defaultValue={business.website || ""} />
        <input name="reviewLink" className="input" placeholder="Google Review Link" defaultValue={business.reviewLink} required />
        <input name="preferredLanguages" className="input" placeholder="Preferred Languages: English,Tamil,Mix" defaultValue={(business.preferredLanguages || ["English"]).join(",")} />

        <select name="tone" className="input" defaultValue={business.tone || "friendly"}>
          <option value="friendly">Friendly</option>
          <option value="simple">Simple</option>
          <option value="professional">Professional</option>
        </select>

        <div>
          <label className="font-bold">Services</label>
          {services.map((s, i) => (
            <div key={i} className="mt-2 flex gap-2">
              <input
                className="input"
                placeholder="Service name"
                value={s}
                onChange={(e) => {
                  const copy = [...services];
                  copy[i] = e.target.value;
                  setServices(copy);
                }}
              />
              {services.length > 1 && (
                <button type="button" onClick={() => setServices(services.filter((_, index) => index !== i))} className="rounded-xl border px-4 font-bold text-red-600">
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setServices([...services, ""])} className="mt-2 text-brand-blue font-semibold">
            + Add Service
          </button>
        </div>

        <div>
          <label className="font-bold">Branch / Service Locations</label>
          {locations.map((l, i) => (
            <div key={i} className="mt-2 flex gap-2">
              <input
                className="input"
                placeholder="Location name"
                value={l}
                onChange={(e) => {
                  const copy = [...locations];
                  copy[i] = e.target.value;
                  setLocations(copy);
                }}
              />
              {locations.length > 1 && (
                <button type="button" onClick={() => setLocations(locations.filter((_, index) => index !== i))} className="rounded-xl border px-4 font-bold text-red-600">
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setLocations([...locations, ""])} className="mt-2 text-brand-blue font-semibold">
            + Add Location
          </button>
        </div>

        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="card border-red-100 bg-red-50">
        <h2 className="text-xl font-bold text-red-700">Delete Business</h2>
        <p className="mt-2 text-sm text-red-700">This will permanently delete this business, its services, locations, review sessions, and analytics.</p>
        <button onClick={deleteBusiness} disabled={deleting} className="mt-4 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow hover:opacity-90">
          {deleting ? "Deleting..." : "Delete Business"}
        </button>
      </div>
    </div>
  );
}
