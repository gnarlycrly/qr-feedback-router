import { useRef } from "react";
import QRCode from "react-qr-code";
import BlackButton from "../components/BlackButton";
import { auth } from "../firebaseConfig";
import { useBusinessData } from "../firebaseHelpers/useBusinessData";
import {useAuth} from "../firebaseHelpers/AuthContext";

const QRCodeGeneration = () => {
  const qrRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;
  const { business, loading } = useBusinessData();

  // Generate the feedback URL with business ID (user's UID)
  const { businessId } = useAuth();
  const feedbackUrl = `${window.location.origin}/feedback?business=${businessId}`;

  const handleDownloadPNG = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (larger for better quality)
    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    // Draw white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, size, size);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      // Download PNG
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        const fileName = business?.name
          ? `${business.name.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`
          : "qr-code.png";
        link.download = fileName;
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    };

    img.src = url;
  };

  const handleDownloadSVG = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    const fileName = business?.name
      ? `${business.name.replace(/\s+/g, '-').toLowerCase()}-qr-code.svg`
      : "qr-code.svg";
    link.download = fileName;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-3xl">
        <p className="text-gray-600">Loading your business information...</p>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-3xl">
        <p className="text-red-600">Please log in to generate your QR code.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Business Info */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">
              {business?.name || "Your Business"}
            </h3>
            {business?.address && (
              <p className="text-sm text-gray-600">{business.address}</p>
            )}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-indigo-200">
          <p className="text-xs text-gray-500 font-mono break-all">
            QR Code URL: {feedbackUrl}
          </p>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="flex flex-col items-center space-y-6">
        <div
          ref={qrRef}
          className="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-200"
        >
          <QRCode
            value={feedbackUrl}
            size={256}
            level="H"
          />
        </div>

        {/* Download Buttons */}
        <div className="flex gap-4">
          <BlackButton
            label="Download PNG"
            onClick={handleDownloadPNG}
          />
          <button
            onClick={handleDownloadSVG}
            className="px-6 py-2 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Download SVG
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-lg">
          <h4 className="font-semibold text-gray-900 mb-2">How to use:</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Download the QR code (PNG for printing, SVG for digital use)</li>
            <li>Print and display at your location (tables, counter, receipts)</li>
            <li>Customers scan with their phone camera</li>
            <li>They're redirected to leave feedback and claim their reward</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGeneration;
