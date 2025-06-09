'use client';
import Image from 'next/image';
import styles from './page.module.css';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';

export default function AdminHome() {
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [qrExists, setQrExists] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [packagedDate, setPackagedDate] = useState('');

  useEffect(() => {
    // Initialize QR scanner
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 350,
        height: 350,
      },
      fps: 5,
    });

    scanner.render(success, error);

    function success(result) {
      // Validate QR code URL
      const qrRegex = /^https:\/\/qr\.lufta\.in\/product\/(.+)$/;
      const match = result.match(qrRegex);

      if (!match) {
        setErrorMessage('The QR code is invalid');
        return; // Keep scanner active
      }

      const keyId = match[1];
      // Check QR code existence via API
      fetch(`/api/qr/check?qr_key=${encodeURIComponent(keyId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.exists) {
            setErrorMessage('QR code already registered');
            setQrExists(true);
            return; // Keep scanner active
          }
          // QR code doesn't exist, fetch products and show form
          setScanResult(result);
          setQrExists(false);
          scanner.clear(); // Stop scanner to show form
          fetch('/api/products')
            .then((res) => res.json())
            .then((products) => setProducts(products))
            .catch((err) => {
              console.error('Error fetching products:', err);
              setErrorMessage('Failed to load products');
            });
        })
        .catch((err) => {
          console.error('Error checking QR code:', err);
          setErrorMessage('Failed to validate QR code');
        });
    }

    function error(err) {
      console.warn('QR scan error:', err);
    }

    return () => scanner.clear(); // Cleanup on unmount
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      // Extract keyId from scanResult
      const qrRegex = /^https:\/\/qr\.lufta\.in\/product\/(.+)$/;
      const keyId = scanResult.match(qrRegex)[1];

      // Send data to create API
      const response = await fetch('/api/qr/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          QRKey: keyId,
          product: selectedProduct,
          packagedDate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create QR code');
      }

      // Success: Reset state and restart scanner
      setScanResult(null);
      setSelectedProduct('');
      setPackagedDate('');
      setErrorMessage('QR code created successfully!');
      // Restart scanner (re-render by resetting state)
      setTimeout(() => {
        setErrorMessage(null);
      }, 2000); // Clear success message after 2 seconds
    } catch (err) {
      console.error('Error creating QR code:', err);
      setErrorMessage(err.message || 'Failed to create QR code');
    }
  };

  return (
    <div className={styles.page}>
      <main className={`${styles.main} ${styles.center}`}>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        {scanResult && !qrExists ? (
          <div>
            <p>New QR code detected! Please fill in the details:</p>
            <form onSubmit={handleFormSubmit} className={styles.form}>
              <div>
                <label htmlFor="product">Select Product:</label>
                <select
                  id="product"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="packagedDate">Packaged Date:</label>
                <input
                  type="date"
                  id="packagedDate"
                  value={packagedDate}
                  onChange={(e) => setPackagedDate(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Create QR Code</button>
            </form>
          </div>
        ) : (
          <div id="reader"></div>
        )}
      </main>
    </div>
  );
}