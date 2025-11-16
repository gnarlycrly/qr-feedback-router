import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import FeedbackForm from "../components/FeedbackForm";
import { useNavigate } from "react-router-dom";

type FormCustomization = {
  businessName: string;
  primaryColor: string;
  accentColor: string;
  headerText: string;
  ratingPrompt: string;
  feedbackPrompt: string;
  submitButtonText: string;
};

const CustomerFormPreview = () => {
  const [formSettings, setFormSettings] = useState<FormCustomization>({
    businessName: "",
    primaryColor: "#4f46e5", // indigo-600
    accentColor: "#6366f1", // indigo-500
    headerText: "How was your experience?",
    ratingPrompt: "Rate your experience",
    feedbackPrompt: "Tell us more about your experience (optional)",
    submitButtonText: "Submit Review"
  });

  // Load business info and theme on mount
  useEffect(() => {
    try {
      const businessInfo = localStorage.getItem("ab_business");
      const theme = localStorage.getItem("ab_theme");
      
      if (businessInfo) {
        const { businessName } = JSON.parse(businessInfo);
        setFormSettings(prev => ({ ...prev, businessName }));
      }
      
      if (theme) {
        const { appPrimary, appAccent } = JSON.parse(theme);
        setFormSettings(prev => ({
          ...prev,
          primaryColor: appPrimary || prev.primaryColor,
          accentColor: appAccent || prev.accentColor
        }));
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const navigate = useNavigate();

  const handleSave = () => {
    // Update theme
    document.documentElement.style.setProperty("--app-primary", formSettings.primaryColor);
    document.documentElement.style.setProperty("--app-accent", formSettings.accentColor);
    
    // Persist settings
    localStorage.setItem("ab_theme", JSON.stringify({
      appPrimary: formSettings.primaryColor,
      appAccent: formSettings.accentColor
    }));

    // Update business name if changed
    const businessInfo = localStorage.getItem("ab_business");
    if (businessInfo) {
      const info = JSON.parse(businessInfo);
      localStorage.setItem("ab_business", JSON.stringify({
        ...info,
        businessName: formSettings.businessName
      }));
    }

    // Persist form customizations
    localStorage.setItem("ab_form_settings", JSON.stringify(formSettings));
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
              value={formSettings.businessName}
              onChange={(e) => setFormSettings(prev => ({ ...prev, businessName: e.target.value }))}
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
                  value={formSettings.primaryColor}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="h-9 w-16"
                />
                <input
                  type="text"
                  value={formSettings.primaryColor}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
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
                  value={formSettings.accentColor}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="h-9 w-16"
                />
                <input
                  type="text"
                  value={formSettings.accentColor}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, accentColor: e.target.value }))}
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
              value={formSettings.headerText}
              onChange={(e) => setFormSettings(prev => ({ ...prev, headerText: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating Prompt
            </label>
            <input
              type="text"
              value={formSettings.ratingPrompt}
              onChange={(e) => setFormSettings(prev => ({ ...prev, ratingPrompt: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Prompt
            </label>
            <input
              type="text"
              value={formSettings.feedbackPrompt}
              onChange={(e) => setFormSettings(prev => ({ ...prev, feedbackPrompt: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submit Button Text
            </label>
            <input
              type="text"
              value={formSettings.submitButtonText}
              onChange={(e) => setFormSettings(prev => ({ ...prev, submitButtonText: e.target.value }))}
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
          <FeedbackForm customization={formSettings} />
        </div>
      </div>
    </div>
  );
};

export default CustomerFormPreview;