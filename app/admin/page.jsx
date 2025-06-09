'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";

export default function AdminHome() {

  const [scanResult, setScanResult] = useState(null);

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
      scanner.clear();
      setScanResult(result)
    }

    function error(err) {
      console.warn(err);
    }
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {
          scanResult ? (<p>{scanResult}</p>) : (<div id="reader"></div>)
        }
      </main>
    </div>
  );
}