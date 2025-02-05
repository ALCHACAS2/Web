import React, { useState, useEffect, useRef } from 'react';
import Quagga from 'quagga';
import './BarcodeScanner.css';

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
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
        },
      },
      locate: true,
      decoder: {
        readers: ["ean_reader", "ean_8_reader", "code_128_reader", "upc_reader"],
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
    <div className="scanner-container">
      <button 
        onClick={isScanning ? stopScanner : startScanner}
        className={`scanner-button ${isScanning ? 'stop' : 'start'}`}
      >
        {isScanning ? '⏹️ Detener' : '📷 Escanear'}
      </button>

      <button 
        onClick={copyToClipboard}
        disabled={scannedItems.length === 0}
        className="copy-button"
      >
        📋 Copiar Lista
      </button>

      <div ref={scannerRef} className={`scanner-view ${isScanning ? 'active' : ''}`}>
        <div className="scanner-line"/>
      </div>

      {lastScanned && (
        <div className="last-scanned">
          <p className="label">Último escaneado:</p>
          <p className="code">{lastScanned}</p>
        </div>
      )}

      <div className="scanned-list">
        {scannedItems.map((item) => (
          <div key={item.id} className="scanned-item">
            {item.code}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarcodeScanner;
