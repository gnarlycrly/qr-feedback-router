import { useState } from "react";
import GrayContainer from "../components/GrayContainer";
import GrayedTextbox from "../components/GrayedTextbox";
import BlackButton from "../components/BlackButton";

const QRCodeGeneration = () => {
  const [qrUrl, setQrUrl] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);

  const handleGenerate = () => {
    if (!qrUrl.trim()) return;
    setQrGenerated(true);
  };

  return (
    <GrayContainer className="max-w-3xl">
      <h2 className="page-heading">QR Code Generation</h2>
      <p className="heading-explanation">
        Generate QR codes that link directly to your business’s feedback or reward pages.
      </p>

      <div className="space-y-4">
        <GrayedTextbox
          placeholder="Enter URL to link (e.g., your feedback page)"
          value={qrUrl}
          onChange={(e) => setQrUrl(e.target.value)}
        />
        <BlackButton label="Generate QR Code" onClick={handleGenerate} />

        {qrGenerated ? (
          <div className="mt-6 flex flex-col items-center">
            <div className="w-48 h-48 bg-white border border-gray-300 flex items-center justify-center text-gray-400">
              (QR Preview Placeholder)
            </div>
            <p className="text-gray-500 text-sm mt-2">QR for: {qrUrl}</p>
          </div>
        ) : (
          <div className="mt-6 text-gray-500 text-sm text-center">
            QR code preview will appear here after generation.
          </div>
        )}
      </div>
    </GrayContainer>
  );
};

export default QRCodeGeneration;
