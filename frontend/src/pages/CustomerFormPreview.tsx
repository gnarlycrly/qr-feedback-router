import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import FeedbackForm from "../components/FeedbackForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../firebaseHelpers/AuthContext";
import { useBusinessData } from "../firebaseHelpers/useBusinessData";
import { useUpdateBusinessData } from "../firebaseHelpers/useUpdateBusinessData";
type FormCustomization = {
  customer_businessName: string;
  customer_primaryColor: string;
  customer_accentColor: string;
  customer_headerText: string;
  customer_ratingPrompt: string;
  customer_feedbackPrompt: string;
  customer_submitButtonText: string;
};

const CustomerFormPreview = () => {
  const [formSettings, setFormSettings] = useState<FormCustomization>({
    customer_businessName: "",
    customer_primaryColor: "#4f46e5", // indigo-600
    customer_accentColor: "#6366f1", // indigo-500
    customer_headerText: "How was your experience?",
    customer_ratingPrompt: "Rate your experience",
    customer_feedbackPrompt: "Tell us more about your experience (optional)",
    customer_submitButtonText: "Submit Review"
  });
  // Load business info and theme on mount
  useEffect(() => {
    try {
      const businessInfo = localStorage.getItem("ab_business");
      const theme = localStorage.getItem("ab_theme");
      
      if (businessInfo) {
        const { customer_businessName } = JSON.parse(businessInfo);
        setFormSettings(prev => ({ ...prev, customer_businessName }));
      }
      
      if (theme) {
        const { appPrimary, appAccent } = JSON.parse(theme);
        setFormSettings(prev => ({
          ...prev,
          customer_primaryColor: appPrimary || prev.customer_primaryColor,
          customer_accentColor: appAccent || prev.customer_accentColor
        }));
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const { business} = useBusinessData();
  const { businessId } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const updateBusinessData = useUpdateBusinessData();

   useEffect(() => {
      if (business && !initialized) {
        setFormSettings({
          customer_businessName: business.customer_businessName || "Sample Business",
          customer_primaryColor: "#1A3673",
          customer_accentColor: "#2563eb",
          customer_headerText: business.customer_headerText || "How was your experience?",
          customer_ratingPrompt: business.customer_ratingPrompt|| "Rate your experience",
          customer_feedbackPrompt: business.customer_feedbackPrompt || "Tell us more about your experience (optional)",
          customer_submitButtonText: business.customer_submitButtonText || "Submit Review",
        });
        setInitialized(true);
      }
    }, [business,initialized]);

  const navigate = useNavigate();

  const handleSave = async () => {
    // Update theme
    document.documentElement.style.setProperty("--app-primary", formSettings.customer_primaryColor);
    document.documentElement.style.setProperty("--app-accent", formSettings.customer_accentColor);
    
    // Persist settings
    localStorage.setItem("ab_theme", JSON.stringify({
      appPrimary: formSettings.customer_primaryColor,
      appAccent: formSettings.customer_accentColor
    }));

    // Update business name if changed
    const businessInfo = localStorage.getItem("ab_business");
    if (businessInfo) {
      const info = JSON.parse(businessInfo);
      localStorage.setItem("ab_business", JSON.stringify({
        ...info,
        customer_businessName: formSettings.customer_businessName
      }));
    }

    // Persist form customizations
    localStorage.setItem("ab_form_settings", JSON.stringify(formSettings));

    try {
      await updateBusinessData(formSettings);
      
    } catch (err: any) {
      console.error("Error updating Firestore:", err);
      alert("Error saving data: " + err.message);
    } finally {

    }
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Settings Panel */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Form Customization</h2>
          <p className="text-gray-600 text-sm">
            Customize how your feedback form appears to customers.
            Changes are previewed live on the right.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={formSettings.customer_businessName}
              onChange={(e) => setFormSettings(prev => ({ ...prev, customer_businessName: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formSettings.customer_primaryColor}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, customer_primaryColor: e.target.value }))}
                  className="h-9 w-16"
                />
                <input
                  type="text"
                  value={formSettings.customer_primaryColor}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, customer_primaryColor: e.target.value }))}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formSettings.customer_accentColor}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, customer_accentColor: e.target.value }))}
                  className="h-9 w-16"
                />
                <input
                  type="text"
                  value={formSettings.customer_accentColor}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, customer_accentColor: e.target.value }))}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Header Text
            </label>
            <input
              type="text"
              value={formSettings.customer_headerText}
              onChange={(e) => setFormSettings(prev => ({ ...prev, customer_headerText: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating Prompt
            </label>
            <input
              type="text"
              value={formSettings.customer_ratingPrompt}
              onChange={(e) => setFormSettings(prev => ({ ...prev, customer_ratingPrompt: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Prompt
            </label>
            <input
              type="text"
              value={formSettings.customer_feedbackPrompt}
              onChange={(e) => setFormSettings(prev => ({ ...prev, customer_feedbackPrompt: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submit Button Text
            </label>
            <input
              type="text"
              value={formSettings.customer_submitButtonText}
              onChange={(e) => setFormSettings(prev => ({ ...prev, customer_submitButtonText: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-app-primary text-white rounded-lg px-4 py-2 hover:opacity-90 transition"
          >
            Save Changes
          </button>
          <button
            onClick={() => navigate("/feedback", { state: { next: "/reward" } })}
            className="w-full mt-2 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Start Customer Flow
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div>
        <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Eye size={16} />
            <span>Customer Preview</span>
          </div>
          <FeedbackForm customization={formSettings} businessId={businessId || undefined}/>
        </div>
      </div>
    </div>
  );
};

export default CustomerFormPreview;