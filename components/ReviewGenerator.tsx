"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  business: {
    id: string;
    name: string;
    reviewLink: string;
    services: string[];
    locations: string[];
    defaultService?: string;
    staff?: string;
  };
};

const experienceOptions = [
  "Team came on time",
  "Work was neat",
  "Good product quality",
  "Price was reasonable",
  "Staff explained clearly",
  "Fast response",
  "Problem solved properly",
];

const loadingMessages = [
  "Understanding your real experience...",
  "Checking service and location...",
  "Writing natural review options...",
  "Making the wording more human...",
  "Finalizing your review options...",
];

export function ReviewGenerator({ business }: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<any>(null);
  const [reviewTexts, setReviewTexts] = useState<{ short: string; medium: string; casual: string }>({ short: "", medium: "", casual: "" });
  const [sessionId, setSessionId] = useState("");
  const [selectedExp, setSelectedExp] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      setMessageIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        return Math.min(prev + Math.floor(Math.random() * 10) + 5, 92);
      });
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 700);

    return () => clearInterval(timer);
  }, [loading]);

  async function generate(e?: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();

    if (!confirmed) {
      alert("Please confirm this is based on your real experience.");
      return;
    }

    if (!formRef.current) return;

    const form = new FormData(formRef.current);
    setLoading(true);
    setReviews(null);
    setReviewTexts({ short: "", medium: "", casual: "" });
    setProgress(8);

    const payload = {
      businessId: business.id,
      businessName: business.name,
      service: form.get("service"),
      location: form.get("location"),
      rating: Number(form.get("rating")),
      language: form.get("language"),
      length: form.get("length"),
      tone: form.get("tone"),
      experiencePoints: selectedExp,
      staff: business.staff,
      customerName: (form.get("customerName") as string)?.trim() || "",
      customerArea: (form.get("customerArea") as string)?.trim() || "",
    };

    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setProgress(100);

      setTimeout(() => {
        if (data?.reviews) {
          setReviews(data.reviews);
          setReviewTexts({
            short: data.reviews.short || "",
            medium: data.reviews.medium || "",
            casual: data.reviews.casual || "",
          });
          setSessionId(data.sessionId || "");
        } else {
          alert(data?.error || "Unable to generate review. Please try again.");
        }
        setLoading(false);
      }, 350);
    } catch (error) {
      console.log("Review generation failed:", error);
      setLoading(false);
      alert("Unable to generate review now. Please try again.");
    }
  }

  async function track(actionType: string) {
    await fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify({ businessId: business.id, actionType, sessionId }),
      headers: { "Content-Type": "application/json" },
    });
  }

  async function copyReview(text: string) {
    await navigator.clipboard.writeText(text);
    await track("copy_review");
    alert("Review copied. Now open Google review link and paste it.");
  }

  async function openGoogle() {
    await track("google_link_click");
    window.open(business.reviewLink, "_blank");
  }

  return (
    <div className="space-y-6">
      <form ref={formRef} onSubmit={generate} className="card space-y-4">

        {/* Customer Details */}
        <div className="rounded-xl bg-orange-50 p-4 space-y-3">
          <p className="font-bold text-sm text-orange-800">Your Details (helps personalise your review)</p>
          <input
            name="customerName"
            className="input"
            placeholder="Your Name (e.g. Ramesh, Priya) — optional"
          />
          <input
            name="customerArea"
            className="input"
            placeholder="Your Area (e.g. Anna Nagar, Madurai) — optional"
          />
        </div>

        <select name="service" defaultValue={business.defaultService || ""} className="input" required>
          <option value="">Select service used</option>
          {business.services.map((s) => <option key={s}>{s}</option>)}
        </select>

        <select name="location" className="input" required>
          <option value="">Select area/location</option>
          {business.locations.map((l) => <option key={l}>{l}</option>)}
        </select>

        <select name="rating" className="input" required>
          <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
          <option value="4">4 Stars ⭐⭐⭐⭐</option>
          <option value="3">3 Stars ⭐⭐⭐</option>
          <option value="2">2 Stars ⭐⭐</option>
          <option value="1">1 Star ⭐</option>
        </select>

        <div>
          <p className="mb-2 font-bold">Select your real experience</p>
          <div className="grid gap-2 md:grid-cols-2">
            {experienceOptions.map((x) => (
              <label key={x} className="rounded-xl border bg-white p-3 cursor-pointer hover:bg-orange-50">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedExp.includes(x)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedExp([...selectedExp, x]);
                    else setSelectedExp(selectedExp.filter(i => i !== x));
                  }}
                />
                {x}
              </label>
            ))}
          </div>
        </div>

        <select name="language" className="input">
          <option>English</option>
          <option>Tamil</option>
          <option>Tanglish</option>
          <option>Hindi</option>
        </select>

        <select name="length" className="input">
          <option value="short">Short</option>
          <option value="medium">Medium</option>
        </select>

        <select name="tone" className="input">
          <option value="simple">Simple</option>
          <option value="casual">Casual</option>
          <option value="professional">Professional</option>
        </select>

        <label className="block rounded-xl bg-orange-50 p-4 text-sm cursor-pointer">
          <input type="checkbox" className="mr-2" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          I confirm this review is based on my real experience.
        </label>

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Generating..." : "Generate Review Options"}
        </button>

        {loading && (
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-orange" />
              <div className="flex-1">
                <p className="font-bold">{loadingMessages[messageIndex]}</p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-brand-orange transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">{progress}% complete</p>
              </div>
            </div>
          </div>
        )}
      </form>

      {reviews && (
        <div className="space-y-4">
          {(["short", "medium", "casual"] as const).map((type) => (
            <div className="card" key={type}>
              <h3 className="mb-3 text-lg font-bold capitalize">{type} Review</h3>
              <textarea
                className="input min-h-28"
                value={reviewTexts[type]}
                onChange={(e) =>
                  setReviewTexts((prev) => ({ ...prev, [type]: e.target.value }))
                }
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => copyReview(reviewTexts[type])} className="btn-primary">Copy Review</button>
                <button onClick={() => generate()} className="btn-secondary" disabled={loading}>Regenerate</button>
              </div>
            </div>
          ))}

          <button onClick={openGoogle} className="btn-secondary w-full">
            Open Google Review Link
          </button>
        </div>
      )}
    </div>
  );
}
