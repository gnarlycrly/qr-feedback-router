import React, { useEffect, useState } from "react";
import BlackButton from "../components/BlackButton";
import FeedbackForm from "../components/FeedbackForm";
import { Eye, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "../firebaseHelpers/AuthContext";
import { useBusinessData } from "../firebaseHelpers/useBusinessData";
import { useUpdateBusinessData } from "../firebaseHelpers/useUpdateBusinessData";

const BusinessEdit: React.FC = () => {
  const { business, loading } = useBusinessData();
  const updateBusinessData = useUpdateBusinessData();

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

  useEffect(() => {
    if (!business || initialized) return;
    setForm((prev) => ({
      ...prev,
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
  }, [business, initialized]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Keep customer-facing business name in sync with main business name
    if (name === "name") {
      setForm((s) => ({ ...s, name: value, customer_businessName: value }));
      return;
    }
    setForm((s) => ({ ...s, [name]: value }));
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
  const [collapsedBrand, setCollapsedBrand] = useState(false);
  const [collapsedCopy, setCollapsedCopy] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);

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
                <div>
                  <label className="block text-sm text-gray-700">Accent Color</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" name="customer_accentColor" value={form.customer_accentColor} onChange={handleChange} className="h-9 w-12 p-0 border-0 rounded" />
                    <input name="customer_accentColor" value={form.customer_accentColor} onChange={handleChange} className="w-36 rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Feedback Copy */}
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
              <div className="text-lg font-semibold text-gray-800 leading-tight">Feedback Copy</div>
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
          }
        }} className="btn-secondary">Reset</button>
        </div>

        {/* Preview toggle (collapsed by default) */}
        <div>
          <label className="inline-flex items-center gap-3">
            <input type="checkbox" className="form-checkbox" checked={previewVisible} onChange={(e) => setPreviewVisible(e.target.checked)} />
            <span className="text-sm text-gray-700">Preview customer experience</span>
          </label>
        </div>
      </div>

      {/* Inline preview controlled by previewVisible state */}
      {previewVisible && (
        <section className="rounded-lg bg-gray-50 p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Eye size={16} />
              <h3 className="font-medium">Customer Experience Preview</h3>
            </div>

            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-1 rounded-md bg-white border border-gray-100 text-gray-700">Mobile preview</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div style={{ width: 390 }} className="bg-transparent flex items-center justify-center">
              <div className="rounded-2xl bg-white" style={{ width: '100%', border: '1px solid rgba(0,0,0,0.06)', padding: 20 }}>
                <div className="mx-auto" style={{ maxWidth: 360 }}>
                  <FeedbackForm customization={customization} businessId={businessId || undefined} />
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
