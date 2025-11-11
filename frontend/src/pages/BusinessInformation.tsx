import GrayContainer from "../components/GrayContainer";
import React, { useState, useEffect } from "react";
import GrayedTextbox from "../components/GrayedTextbox";
import BlackButton from "../components/BlackButton";
import { getBusinessData } from "../firebaseHelpers/getBusinessData";
import { updateBusinessData } from "../firebaseHelpers/updateBusinessData";

const BusinessInformation = () => {
  const { business, loading } = getBusinessData();
  const [initialized, setInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: "Loading ...",
    phone_number: "Loading ...",
    address: "Loading ...",
    email: "Loading ...",
    website_url : "Loading ...",
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (business && !initialized) {
      setFormData({
        name: business.name || "Missing",
        phone_number: business.phone_number || "Missing",
        address: business.address || "Missing",
        email: business.email || "Missing",
        website_url : business.website_url || "Missing"
      });
      setInitialized(true);
    }
  }, [business,initialized]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBusinessData(formData);
    } catch (err: any) {
      console.error("Error updating Firestore:", err);
      alert("Error saving data: " + err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <GrayContainer className="max-w-3xl">
      <h2 className="page-heading">Business Information</h2>
      <p className="heading-explanation">
        Update your business details below. These will be displayed to customers on your reward and feedback pages.
      </p>

      <form className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
        <GrayedTextbox name = "name"value={formData.name} onChange={handleChange} />
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
        <GrayedTextbox name = "address" value={formData.address} onChange={handleChange}/>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <GrayedTextbox name = "phone_number" value={formData.phone_number} onChange={handleChange} />
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
        <GrayedTextbox name = "email" value={formData.email}  onChange={handleChange}/>
        <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
        <GrayedTextbox name = "website_url" value={formData.website_url} onChange={handleChange} />
        <BlackButton type="button" label={saving ? "Saving..." : "Save Changes"} onClick={handleSave}  />
      </form>
    </GrayContainer>
  );
};

export default BusinessInformation;
