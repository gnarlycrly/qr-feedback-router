// Brand customization panel. Lets a business pick a primary color and tagline. Uses ThemeProvider to persist choices.
import GrayContainer from "../components/GrayContainer";
import GrayedTextbox from "../components/GrayedTextbox";
import { useEffect, useState } from "react";
import { useTheme } from "../theme/ThemeProvider";

const BrandCustomization = () => {
  const { theme, setTheme } = useTheme();
  const [primary, setPrimary] = useState(theme.appPrimary || "#1A3673");
  const [tagline, setTagline] = useState("");

  useEffect(() => {
    try {
      const businessRaw = localStorage.getItem("ab_business");
      if (businessRaw) {
        const parsed = JSON.parse(businessRaw);
        if (parsed?.tagline) setTagline(parsed.tagline);
      }
    } catch (e) {}
  }, []);

  const handleSave = () => {
    // update theme via provider (persist). Match signup: primary color is used for both primary and accent.
    setTheme({ appPrimary: primary, appAccent: primary });

    // persist business tagline
    try {
      const raw = localStorage.getItem("ab_business");
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem("ab_business", JSON.stringify({ ...parsed, tagline }));
    } catch (e) {}
  };

  return (
    <GrayContainer className="max-w-3xl">
      <h2 className="page-heading">Brand Customization</h2>
      <p className="heading-explanation">
        Personalize your brand's look and feel for your feedback and reward experience.
      </p>

      <div className="space-y-6">
        <div>
          <label className="secondary-heading">Primary Color</label>
          <div className="flex items-center gap-3 mt-2">
            <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-20 h-10 rounded-lg border border-gray-300" />
            <input value={primary} onChange={(e) => setPrimary(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="secondary-heading">Upload Logo</label>
          <input type="file" accept="image/*" className="w-full border border-gray-300 rounded-lg bg-gray-100 p-2 mt-2" />
        </div>

        <div>
          <label className="secondary-heading">Tagline</label>
            <GrayedTextbox value={tagline} onChange={(e:any) => setTagline(e.target.value)} placeholder="Serving happiness since" />
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} className="bg-app-primary text-white px-4 py-2 rounded-lg">Save Customizations</button>
          <button onClick={() => { setPrimary(theme.appPrimary || "#1A3673"); }} className="border border-gray-200 px-4 py-2 rounded-lg">Reset</button>
        </div>
      </div>
    </GrayContainer>
  );
};

export default BrandCustomization;
