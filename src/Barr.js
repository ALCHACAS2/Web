// Barr.js
import { useState, useCallback } from "react";
import BarcodeScanner from "react-qr-scanner";

export default function ScannerPage() {
  const [codes, setCodes] = useState("");
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = useCallback((data) => {
    if (data) {
      setCodes((prev) => (prev ? `${prev}\n${data.text}` : data.text));
    }
  }, []);

  const handleError = useCallback((err) => {
    console.error("Scanner Error:", err);
  }, []);

  const clearCodes = useCallback(() => {
    setCodes("");
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codes);
      alert("Copied to clipboard!"); // Simple feedback
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy to clipboard");
    }
  }, [codes]);

  const toggleScanner = useCallback(() => {
    setIsScanning(prev => !prev);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1rem',
      gap: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        {isScanning && (
          <BarcodeScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
            constraints={{
              audio: false,
              video: { facingMode: "environment" }
            }}
          />
        )}
      </div>

      <div style={{ width: '100%', maxWidth: '500px' }}>
        <textarea
          style={{
            width: '100%',
            height: '160px',
            padding: '8px',
            marginBottom: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
          value={codes}
          readOnly
          placeholder="Scanned codes will appear here..."
        />

        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center'
        }}>
          <button
            onClick={toggleScanner}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            {isScanning ? "Pause Scanner" : "Start Scanner"}
          </button>
          <button
            onClick={clearCodes}
            disabled={!codes}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#ff4444',
              color: 'white',
              cursor: codes ? 'pointer' : 'not-allowed',
              opacity: codes ? 1 : 0.5
            }}
          >
            Clear
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!codes}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#4444ff',
              color: 'white',
              cursor: codes ? 'pointer' : 'not-allowed',
              opacity: codes ? 1 : 0.5
            }}
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}