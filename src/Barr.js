import { useState, useCallback, useEffect } from "react";
import BarcodeReader from "react-barcode-reader"; // Importar la librería

export default function ScannerPage() {
  const [codes, setCodes] = useState([]);
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);

  // Verificar permisos para acceder a la cámara
  useEffect(() => {
    const checkPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
      } catch (err) {
        setHasPermission(false);
      }
    };
    checkPermission();
  }, []);

  const handleScan = useCallback((data) => {
    if (data) {
      const newCode = data;
      
      // Verificar si el código ya está en la lista
      if (!codes.includes(newCode)) {
        setCodes((prev) => [...prev, newCode]);  // Agregar el código si no está en la lista
      }
    }
  }, [codes]);

  const handleError = useCallback((err) => {
    console.error("Scanner Error:", err);
  }, []);

  const clearCodes = useCallback(() => {
    setCodes([]);
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      alert("Copied to clipboard!"); // Simple feedback
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy to clipboard");
    }
  }, [codes]);

  const toggleScanner = useCallback(() => {
    setIsScanning(prev => !prev);
  }, []);

  // Si no hay permisos, mostrar un mensaje
  if (hasPermission === false) {
    return <div>No se puede acceder a la cámara. Por favor, verifica los permisos.</div>;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1rem',
      gap: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        {hasPermission === null ? (
          <div>Verificando permisos...</div>
        ) : (
          isScanning && (
            <BarcodeReader
              onError={handleError}
              onScan={handleScan}
              facingMode="environment" // Habilitar la cámara trasera
              style={{ width: '100%' }}
            />
          )
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
          value={codes.join("\n")}
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
            disabled={!codes.length}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#ff4444',
              color: 'white',
              cursor: codes.length ? 'pointer' : 'not-allowed',
              opacity: codes.length ? 1 : 0.5
            }}
          >
            Clear
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!codes.length}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#4444ff',
              color: 'white',
              cursor: codes.length ? 'pointer' : 'not-allowed',
              opacity: codes.length ? 1 : 0.5
            }}
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
