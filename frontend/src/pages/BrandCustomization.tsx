import GrayContainer from "../components/GrayContainer";
import GrayedTextbox from "../components/GrayedTextbox";
import BlackButton from "../components/BlackButton";

const BrandCustomization = () => {
  return (
    <GrayContainer className="max-w-3xl">
      <h2 className="page-heading">Brand Customization</h2>
      <p className="heading-explanation">
        Personalize your brand's look and feel for your feedback and reward experience.
      </p>

      <div className="space-y-6">
        <div>
          <label className="secondary-heading">Primary Color</label>
          <ColorPicker/>
        </div>

        <div>
          <label className="secondary-heading">Secondary Color</label>
          <ColorPicker/>
        </div>

        <div>
          <label className="secondary-heading">Upload Logo</label>
          <input type="file" accept="image/*" className="w-full border border-gray-300 rounded-lg bg-gray-100 p-2" />
        </div>

        <div>
          <label className="secondary-heading">Tagline</label>
            <GrayedTextbox placeholder="Serving happiness since" />
        </div>

        <BlackButton label="Save Customizations" />
      </div>
    </GrayContainer>
  );
};

const ColorPicker = ({}: any) => (
  <input type="color" className="w-20 h-10 rounded-lg border border-gray-300 bg-gray-100" />
);

export default BrandCustomization;
