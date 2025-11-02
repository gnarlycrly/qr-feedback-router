import GrayContainer from "../components/GrayContainer";
import GrayedTextbox from "../components/GrayedTextbox";
import BlackButton from "../components/BlackButton";

const BusinessInformation = () => {
  return (
    <GrayContainer className="max-w-3xl">
      <h2 className="page-heading">Business Information</h2>
      <p className="heading-explanation">
        Update your business details below. These will be displayed to customers on your reward and feedback pages.
      </p>

      <form className="space-y-4">
        <GrayedTextbox placeholder="Business Name" />
        <GrayedTextbox placeholder="Business Address" />
        <GrayedTextbox placeholder="Phone Number" />
        <GrayedTextbox placeholder="Business Email" />
        <GrayedTextbox placeholder="Website URL (optional)" />
        <BlackButton label="Save Changes" />
      </form>
    </GrayContainer>
  );
};

export default BusinessInformation;
