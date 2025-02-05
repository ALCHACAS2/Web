import React, { useState, useEffect, useRef } from 'react';
import Quagga from 'quagga';

const BarcodeScanner = () => {
  const [scannedItems, setScannedItems] = useState([]);
  const [lastScanned, setLastScanned] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  const startScanner = () => {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment",
          aspectRatio: { min: 1, max: 2 }
        },
      },
      locate: true,
      decoder: {
        readers: ["ean_reader", "ean_8_reader"],
        debug: {
          drawBoundingBox: true,
          showPattern: true,
        }
      },
      frequency: 10
    }, (err) => {
      if (err) {
        console.error("Error iniciando el escáner:", err);
        return;
      }
      Quagga.start();
      setIsScanning(true);
    });

    let lastResult = null;
    let sameResultCount = 0;

    Quagga.onDetected((result) => {
      const code = result.codeResult.code;
      if (code.length !== 13 && code.length !== 8) return;

      if (code === lastResult) {
        sameResultCount++;
        if (sameResultCount >= 3) {
          setLastScanned(code);
          setScannedItems(prev => {
            if (!prev.some(item => item.code === code)) {
              return [...prev, { code, id: Date.now() }];
            }
            return prev;
          });
          stopScanner();
          sameResultCount = 0;
        }
      } else {
        sameResultCount = 1;
        lastResult = code;
      }
    });
  };

  const stopScanner = () => {
    Quagga.stop();
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      Quagga.stop();
    };
  }, []);

  const copyToClipboard = () => {
    const text = scannedItems.map(item => item.code).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      alert("Lista copiada al portapapeles");
    }).catch(err => console.error("Error al copiar:", err));
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '20px auto',
      padding: '20px',
    }}>
      <button 
        onClick={isScanning ? stopScanner : startScanner}
        style={{
          width: '100%',
          padding: '15px',
          backgroundColor: isScanning ? '#dc2626' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          marginBottom: '10px'
        }}
      >
        {isScanning ? '⏹️ Detener' : '📷 Escanear'}
      </button>

      <button 
        onClick={copyToClipboard}
        disabled={scannedItems.length === 0}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: scannedItems.length === 0 ? '#9ca3af' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        📋 Copiar Lista
      </button>

      <div 
        ref={scannerRef}
        style={{
          position: 'relative',
          border: isScanning ? '2px solid #2563eb' : 'none',
          borderRadius: '8px',
          overflow: 'hidden',
          display: isScanning ? 'block' : 'none',
          marginBottom: '20px'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '2px',
          backgroundColor: 'red',
          zIndex: 1
        }}/>
      </div>

      {lastScanned && (
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Último escaneado:</p>
          <p style={{ 
            margin: '5px 0 0 0',
            fontFamily: 'monospace',
            fontSize: '18px' 
          }}>{lastScanned}</p>
        </div>
      )}

      <div style={{
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}>
        {scannedItems.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '10px',
              borderBottom: '1px solid #e5e7eb',
              fontFamily: 'monospace',
              fontSize: '16px'
            }}
          >
            {item.code}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarcodeScanner;
