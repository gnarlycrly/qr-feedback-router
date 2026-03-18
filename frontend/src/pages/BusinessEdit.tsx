import React, { useEffect, useState } from "react";
import BlackButton from "../components/BlackButton";
import FeedbackForm from "../components/FeedbackForm";
import { ChevronDown, ChevronRight, Check, Gift } from "lucide-react";
import { useAuth } from "../firebaseHelpers/AuthContext";
import { useBusinessData } from "../firebaseHelpers/useBusinessData";
import { useUpdateBusinessData } from "../firebaseHelpers/useUpdateBusinessData";
import { useSubscription } from "../firebaseHelpers/useSubscription";
import SubscriptionGate from "../components/SubscriptionGate";

const BusinessEdit: React.FC = () => {
  const { business, loading } = useBusinessData();
  const updateBusinessData = useUpdateBusinessData();
  const { isPro } = useSubscription();

  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  

  const [form, setForm] = useState({
    // business fields
    name: "",
    phone_number: "",
    address: "",
    email: "",
    website_url: "",
    // customer-facing form customization
    customer_businessName: "",
    customer_primaryColor: "#2563eb",
    customer_accentColor: "#8b5cf6",
    customer_headerText: "How was your experience?",
    customer_ratingPrompt: "Rate your experience",
    customer_feedbackPrompt: "Tell us more about your experience (optional)",
    customer_submitButtonText: "Submit Review",
  });

  const STORAGE_PRIMARY = "ab_customer_primaryColor";
  const STORAGE_ACCENT = "ab_customer_accentColor";

  useEffect(() => {
    if (!business || initialized) return;
    // If the user has previously chosen colors in this browser session, prefer those
    const storedPrimary = typeof window !== "undefined" ? localStorage.getItem(STORAGE_PRIMARY) : null;
    const storedAccent = typeof window !== "undefined" ? localStorage.getItem(STORAGE_ACCENT) : null;

    setForm((prev) => ({
      ...prev,
      name: business.name || "",
      phone_number: business.phone_number || "",
      address: business.address || "",
      email: business.email || "",
      website_url: business.website_url || "",
      customer_businessName: business.customer_businessName || business.name || prev.customer_businessName,
      // prefer locally-chosen values so opening this panel doesn't clobber a user's temporary selection
      customer_primaryColor: storedPrimary || business.customer_primaryColor || prev.customer_primaryColor,
      customer_accentColor: storedAccent || business.customer_accentColor || prev.customer_accentColor,
      customer_headerText: business.customer_headerText || prev.customer_headerText,
      customer_ratingPrompt: business.customer_ratingPrompt || prev.customer_ratingPrompt,
      customer_feedbackPrompt: business.customer_feedbackPrompt || prev.customer_feedbackPrompt,
      customer_submitButtonText: business.customer_submitButtonText || prev.customer_submitButtonText,
    }));
    setInitialized(true);
  }, [business, initialized]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Keep customer-facing business name in sync with main business name
    if (name === "name") {
      setForm((s) => ({ ...s, name: value, customer_businessName: value }));
      return;
    }
    setForm((s) => ({ ...s, [name]: value }));

    // Persist temporary brand color choices so reopening the panel doesn't auto-reset them
    if (name === "customer_primaryColor") {
      try {
        localStorage.setItem(STORAGE_PRIMARY, value);
      } catch (e) {
        // ignore (e.g., private mode)
      }
    }
    if (name === "customer_accentColor") {
      try {
        localStorage.setItem(STORAGE_ACCENT, value);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // send a minimal set of fields that we want to persist
      await updateBusinessData({
        name: form.name,
        phone_number: form.phone_number,
        address: form.address,
        email: form.email,
        website_url: form.website_url,
        // always write the business name into the customer-facing name to keep them synced
        customer_businessName: form.name,
        customer_primaryColor: form.customer_primaryColor,
        customer_accentColor: form.customer_accentColor,
        customer_headerText: form.customer_headerText,
        customer_ratingPrompt: form.customer_ratingPrompt,
        customer_feedbackPrompt: form.customer_feedbackPrompt,
        customer_submitButtonText: form.customer_submitButtonText,
      });
      // clear any locally-stored temporary color choices since the saved business now holds the source of truth
      try {
        localStorage.removeItem(STORAGE_PRIMARY);
        localStorage.removeItem(STORAGE_ACCENT);
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      console.error("Error updating business:", err);
      alert(err?.message || "Failed to save business info");
    } finally {
      setSaving(false);
    }
  };

  const { businessId } = useAuth();
  // Accordion state: Business Identity collapsed, Brand Styling expanded, Feedback Copy collapsed
  // Accordion state: Business Identity collapsed, Brand Styling expanded, Feedback Copy collapsed
  const [collapsedIdentity, setCollapsedIdentity] = useState(true);
  // default to collapsed so the Brand Styling accordion isn't auto-opened every time
  const [collapsedBrand, setCollapsedBrand] = useState(true);
  const [collapsedCopy, setCollapsedCopy] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewMode, setPreviewMode] = useState<"form" | "thanks">("form");
  const [submittedFeedbackForPreview, setSubmittedFeedbackForPreview] = useState<{ rating: number; comment: string } | null>(null);

  if (loading && !initialized) {
    return <div className="max-w-3xl">Loading...</div>;
  }

  // build customization object for preview and saving
  const customization = {
    // always show the current business name in the preview (keeps preview consistent)
    customer_businessName: form.name,
    customer_primaryColor: form.customer_primaryColor,
    customer_accentColor: form.customer_accentColor,
    customer_headerText: form.customer_headerText,
    customer_ratingPrompt: form.customer_ratingPrompt,
    customer_feedbackPrompt: form.customer_feedbackPrompt,
    customer_submitButtonText: form.customer_submitButtonText,
  };
  // determine the currently active reward (if any) from the loaded business data
  const activeReward = (business as any)?.rewards ? (business as any).rewards.find((r: any) => r.active) : null;
  // preview defaults: if no submitted preview feedback, show a 5-star empty comment preview
  const previewRating = submittedFeedbackForPreview?.rating ?? 5;
  const previewComment = submittedFeedbackForPreview?.comment ?? "";
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      {/* Business Identity section */}
    <section className="bg-white rounded-md">
        <div className={`w-full flex items-center h-14 px-4 transition-colors duration-150 rounded-md ${collapsedIdentity ? 'hover:bg-gray-50' : 'bg-gray-50'}`}>
          <div className="mr-4">
            <span
              className="block w-1 rounded-l-md h-full"
              style={{ backgroundColor: !collapsedIdentity ? form.customer_primaryColor : '#e6e8eb' }}
              aria-hidden
            />
          </div>
          <button
            id="section-identity-toggle"
            aria-controls="section-identity-panel"
            onClick={() => setCollapsedIdentity((s) => !s)}
            className="flex items-center gap-4 w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md px-2 py-2"
            aria-expanded={!collapsedIdentity}
          >
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-800 leading-tight">Business Identity</div>
              <div className="text-sm text-gray-500">Primary business details (used across the product)</div>
            </div>
            <span className="text-gray-400 ml-3 opacity-80">
              {collapsedIdentity ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
            </span>
          </button>
        </div>
        {!collapsedIdentity && (
          <div id="section-identity-panel" role="region" aria-labelledby="section-identity-toggle" className="px-4 pb-5 pt-2 space-y-4 bg-white border border-transparent rounded-b-md" style={{ borderColor: !collapsedIdentity ? '#f3f4f6' : 'transparent' }}>
            <p className="text-sm text-gray-500">These fields are used on receipts and customer-facing pages. Update the Business Name to change the customer-facing name.</p>
            <div className="border-t border-gray-100 pt-3">
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-md border border-gray-200 px-3 py-2 bg-white text-sm text-gray-700 mt-2" />
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="text-sm text-gray-500">Contact (optional)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-2">
                <input name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="Phone (optional)" className="w-full rounded-md border border-gray-200 px-3 py-1.5 bg-white text-sm text-gray-700" />
                <input name="website_url" value={form.website_url} onChange={handleChange} placeholder="Website (optional)" className="w-full rounded-md border border-gray-200 px-3 py-1.5 bg-white text-sm text-gray-700" />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Brand Styling */}
    <section className="bg-white rounded-md">
        <div className={`w-full flex items-center h-14 px-4 transition-colors duration-150 rounded-md ${collapsedBrand ? 'hover:bg-gray-50' : 'bg-gray-50'}`}>
          <div className="mr-4">
            <span
              className="block w-1 rounded-l-md h-full"
              style={{ backgroundColor: !collapsedBrand ? form.customer_primaryColor : '#e6e8eb' }}
              aria-hidden
            />
          </div>
          <button
            id="section-brand-toggle"
            aria-controls="section-brand-panel"
            onClick={() => setCollapsedBrand((s) => !s)}
            className="flex items-center gap-4 w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md px-2 py-2"
            aria-expanded={!collapsedBrand}
          >
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-800 leading-tight">Brand Styling</div>
              <div className="text-sm text-gray-500">Primary visual theme for customer-facing screens</div>
            </div>
            {!collapsedBrand && (
              <div className="mr-3">
                <span className="inline-block h-6 w-6 rounded-md border border-gray-200" style={{ backgroundColor: form.customer_primaryColor }} aria-hidden />
              </div>
            )}
            <span className="text-gray-400 ml-3 opacity-80">
              {collapsedBrand ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
            </span>
          </button>
        </div>
        {!collapsedBrand && (
          <div id="section-brand-panel" role="region" aria-labelledby="section-brand-toggle" className="px-4 pb-5 pt-2 space-y-4 bg-white border border-transparent rounded-b-md" style={{ borderColor: !collapsedBrand ? '#f3f4f6' : 'transparent' }}>
            <p className="text-sm text-gray-500">Choose primary and accent colors for the customer-facing screens. The swatch shows the currently selected primary color.</p>
            <div className="border-t border-gray-100 pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700">Primary Color</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" name="customer_primaryColor" value={form.customer_primaryColor} onChange={handleChange} className="h-9 w-12 p-0 border-0 rounded" />
                    <input name="customer_primaryColor" value={form.customer_primaryColor} onChange={handleChange} className="w-36 rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-700" />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm text-gray-700">Accent Color {!isPro && <span className="text-xs text-gray-400">(Pro)</span>}</label>
                  {isPro ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input type="color" name="customer_accentColor" value={form.customer_accentColor} onChange={handleChange} className="h-9 w-12 p-0 border-0 rounded" />
                      <input name="customer_accentColor" value={form.customer_accentColor} onChange={handleChange} className="w-36 rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-700" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2 opacity-50 pointer-events-none">
                      <input type="color" value={form.customer_accentColor} disabled className="h-9 w-12 p-0 border-0 rounded" />
                      <input value={form.customer_accentColor} disabled className="w-36 rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-400 bg-gray-50" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Feedback Copy */}
      <SubscriptionGate feature="Feedback Copy Customization" mode={isPro ? "blur" : "blur"}>
    <section className="bg-white rounded-md">
        <div className={`w-full flex items-center h-14 px-4 transition-colors duration-150 rounded-md ${collapsedCopy ? 'hover:bg-gray-50' : 'bg-gray-50'}`}>
          <div className="mr-4">
            <span
              className="block w-1 rounded-l-md h-full"
              style={{ backgroundColor: !collapsedCopy ? form.customer_primaryColor : '#e6e8eb' }}
              aria-hidden
            />
          </div>
          <button
            id="section-copy-toggle"
            aria-controls="section-copy-panel"
            onClick={() => setCollapsedCopy((s) => !s)}
            className="flex items-center gap-4 w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md px-2 py-2"
            aria-expanded={!collapsedCopy}
          >
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-800 leading-tight">Feedback Copy {!isPro && <span className="text-xs text-gray-400">(Pro)</span>}</div>
              <div className="text-sm text-gray-500">Text shown to customers during the feedback flow</div>
            </div>
            <span className="text-gray-400 ml-3 opacity-80">
              {collapsedCopy ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
            </span>
          </button>
        </div>
        {!collapsedCopy && (
          <div id="section-copy-panel" role="region" aria-labelledby="section-copy-toggle" className="px-4 pb-5 pt-2 space-y-4 bg-white border border-transparent rounded-b-md" style={{ borderColor: !collapsedCopy ? '#f3f4f6' : 'transparent' }}>
            <p className="text-sm text-gray-500 max-w-prose">These messages appear to customers during the feedback flow. Keep them concise and helpful — examples are shown in the input placeholders.</p>
            <div className="border-t border-gray-100 pt-3" />
            <div>
              <label className="block text-sm font-medium text-gray-700">Header Text</label>
              <input name="customer_headerText" value={form.customer_headerText} onChange={handleChange} className="w-full rounded-md border border-gray-200 px-3 py-2 bg-white text-sm text-gray-700 mt-2 max-w-prose" placeholder="How was your experience?" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rating Prompt</label>
              <input name="customer_ratingPrompt" value={form.customer_ratingPrompt} onChange={handleChange} className="w-full rounded-md border border-gray-200 px-3 py-2 bg-white text-sm text-gray-700 mt-2 max-w-prose" placeholder="Rate your experience" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Feedback Prompt</label>
              <input name="customer_feedbackPrompt" value={form.customer_feedbackPrompt} onChange={handleChange} className="w-full rounded-md border border-gray-200 px-3 py-2 bg-white text-sm text-gray-700 mt-2 max-w-prose" placeholder="Tell us more about your experience (optional)" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Submit Button Text</label>
              <input name="customer_submitButtonText" value={form.customer_submitButtonText} onChange={handleChange} className="w-full rounded-md border border-gray-200 px-3 py-2 bg-white text-sm text-gray-700 mt-2 max-w-prose" placeholder="Submit Review" />
            </div>
          </div>
        )}
      </section>
      </SubscriptionGate>

      {/* (Behavior & Toggles removed to reduce visual clutter) */}

      {/* Actions */}
      <div className="pt-4 border-t border-gray-100 mt-4 space-y-4">
        <div className="flex items-center gap-3">
          <BlackButton onClick={handleSave} label={saving ? "Saving..." : "Save Changes"} />
          <button onClick={() => {
          // reset to loaded business values
          setInitialized(false);
          if (business) {
            setForm((prev) => ({ ...prev,
              name: business.name || "",
              phone_number: business.phone_number || "",
              address: business.address || "",
              email: business.email || "",
              website_url: business.website_url || "",
              customer_businessName: business.customer_businessName || business.name || prev.customer_businessName,
              customer_primaryColor: business.customer_primaryColor || prev.customer_primaryColor,
              customer_accentColor: business.customer_accentColor || prev.customer_accentColor,
              customer_headerText: business.customer_headerText || prev.customer_headerText,
              customer_ratingPrompt: business.customer_ratingPrompt || prev.customer_ratingPrompt,
              customer_feedbackPrompt: business.customer_feedbackPrompt || prev.customer_feedbackPrompt,
              customer_submitButtonText: business.customer_submitButtonText || prev.customer_submitButtonText,
            }));
            setInitialized(true);
            // if user resets, remove any temporary color overrides
            try {
              localStorage.removeItem(STORAGE_PRIMARY);
              localStorage.removeItem(STORAGE_ACCENT);
            } catch (e) {}
          }
        }} className="btn-secondary">Reset</button>
        </div>

        {/* Preview toggle (collapsed by default) */}
        <div>
          {isPro ? (
            <label className="inline-flex items-center gap-3">
              <input type="checkbox" className="form-checkbox" checked={previewVisible} onChange={(e) => setPreviewVisible(e.target.checked)} />
              <span className="text-sm text-gray-700">Preview customer experience</span>
            </label>
          ) : (
            <label className="inline-flex items-center gap-3 opacity-50 cursor-not-allowed">
              <input type="checkbox" className="form-checkbox" disabled />
              <span className="text-sm text-gray-700">Preview customer experience <span className="text-xs text-gray-400">(Pro)</span></span>
            </label>
          )}
        </div>
      </div>

      {/* Inline preview controlled by previewVisible state */}
      {previewVisible && (
        <section className="rounded-lg bg-gray-50 p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            {/* Preview header left-side removed (icon + title) */}

            <div className="inline-flex items-center gap-2">
              <button
                onClick={() => { setPreviewMode("form"); setSubmittedFeedbackForPreview(null); }}
                className={`px-3 py-1 rounded-md text-sm ${previewMode === "form" ? "bg-white border border-gray-200" : "bg-transparent text-gray-600"}`}
              >
                Feedback form
              </button>
              <button
                onClick={() => setPreviewMode("thanks")}
                className={`px-3 py-1 rounded-md text-sm ${previewMode === "thanks" ? "bg-white border border-gray-200" : "bg-transparent text-gray-600"}`}
              >
                Thank you
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div style={{ width: 390 }} className="bg-transparent flex items-center justify-center">
              <div className="rounded-2xl bg-white" style={{ width: '100%', border: '1px solid rgba(0,0,0,0.06)', padding: 20 }}>
                <div className="mx-auto" style={{ maxWidth: 360 }}>
                  {previewMode === "form" && (
                    <FeedbackForm
                      customization={customization}
                      businessId={businessId || undefined}
                      onSuccess={(data) => {
                        setSubmittedFeedbackForPreview(data);
                        setPreviewMode("thanks");
                      }}
                    />
                  )}

                  {previewMode === "thanks" && (
                    <div className="py-4">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg,' + (customization.customer_primaryColor || '#10b981') + ', #e6f9f0)' }}>
                          <Check className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h2 style={{ color: customization.customer_primaryColor }} className="text-2xl font-bold">Thank you!</h2>
                          <p className="text-gray-700 mt-2 text-sm">Your feedback has been submitted successfully.</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-md bg-gray-50 p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">Your Review</h3>
                            {previewComment && (
                              <p className="mt-2 max-w-prose text-sm text-gray-600 italic">“{previewComment}”</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${i < (previewRating || 0) ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-400'}`}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 text-center text-sm text-gray-600">We truly appreciate you taking the time to share your experience with <span className="font-semibold text-gray-800">{customization.customer_businessName}</span>. Enjoy this thank-you offer on us!</p>

                      <div className="mt-4 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
                        <div className="flex justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                            <Gift className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>

                        <div className="mt-3 text-center">
                          <h3 className="text-lg font-bold text-indigo-700">{activeReward ? activeReward.title : 'Special Thank You Offer!'}</h3>
                          <p className="mt-1 text-sm text-gray-700">{activeReward ? activeReward.description : '20% off your next visit'}</p>
                        </div>
                      </div>

                      {/* Back-to-form button removed: toggle at the top provides mode switching */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BusinessEdit;
