'use client';
import Image from 'next/image';
import styles from './page.module.css';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';

export default function AdminHome() {
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [packagedDate, setPackagedDate] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 350,
        height: 350,
      },
      fps: 60,
    });

    scanner.render(success, error);

    function success(result) {
      const qrRegex = /^https:\/\/qr\.lufta\.in\/product\/(.+)$/;
      const match = result.match(qrRegex);

      if (!match) {
        setErrorMessage('The QR code is invalid');
        return;
      }

      const keyId = match[1];
      fetch(`/api/qr/check?qr_key=${encodeURIComponent(keyId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.exists) {
            setErrorMessage('QR code not found in database');
            return;
          }
          setScanResult(result);
          setQrData(data.qrCode);
          scanner.clear();
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

    return () => scanner.clear();
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { selectedProduct, packagedDate });
    setScanResult(null);
    setQrData(null);
    setSelectedProduct('');
    setPackagedDate('');
    setErrorMessage(null);
  };

  return (
    <div className={styles.page}>
      <main className={`${styles.main} ${styles.center}`}>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        {scanResult && qrData ? (
          <div>
            <p>Success: QR code is valid!</p>
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
              <button type="submit">Submit</button>
            </form>
          </div>
        ) : (
          <div id="reader"></div>
        )}
        Ascendant
      </main>
    </div>
  );
}