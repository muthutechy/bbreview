"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BusinessForm() {
  const router = useRouter();
  const [services, setServices] = useState([""]);
  const [locations, setLocations] = useState([""]);
  const [loading, setLoading] = useState(false);

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
      preferredLanguages: String(form.get("preferredLanguages") || "English").split(",").map(s => s.trim()),
      services: services.filter(Boolean),
      locations: locations.filter(Boolean),
    };

    const res = await fetch("/api/business", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setLoading(false);

    if (data.id) router.push(`/dashboard/business/${data.id}`);
    else alert(data.error || "Something went wrong");
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <input name="name" className="input" placeholder="Business Name" required />
      <input name="category" className="input" placeholder="Category" required />
      <textarea name="address" className="input" placeholder="Address" required />
      <input name="city" className="input" placeholder="City / Service Areas" required />
      <input name="phone" className="input" placeholder="Phone Number" required />
      <input name="website" className="input" placeholder="Website" />
      <input name="reviewLink" className="input" placeholder="Google Review Link" required />
      <input name="preferredLanguages" className="input" placeholder="Preferred Languages: English,Tamil,Mix" />

      <select name="tone" className="input">
        <option value="friendly">Friendly</option>
        <option value="simple">Simple</option>
        <option value="professional">Professional</option>
      </select>

      <div>
        <label className="font-bold">Services</label>
        {services.map((s, i) => (
          <input
            key={i}
            className="input mt-2"
            placeholder="Service name"
            value={s}
            onChange={(e) => {
              const copy = [...services];
              copy[i] = e.target.value;
              setServices(copy);
            }}
          />
        ))}
        <button type="button" onClick={() => setServices([...services, ""])} className="mt-2 text-brand-blue font-semibold">
          + Add Service
        </button>
      </div>

      <div>
        <label className="font-bold">Branch / Service Locations</label>
        {locations.map((l, i) => (
          <input
            key={i}
            className="input mt-2"
            placeholder="Location name"
            value={l}
            onChange={(e) => {
              const copy = [...locations];
              copy[i] = e.target.value;
              setLocations(copy);
            }}
          />
        ))}
        <button type="button" onClick={() => setLocations([...locations, ""])} className="mt-2 text-brand-blue font-semibold">
          + Add Location
        </button>
      </div>

      <button disabled={loading} className="btn-primary w-full">
        {loading ? "Creating..." : "Create Business"}
      </button>
    </form>
  );
}
