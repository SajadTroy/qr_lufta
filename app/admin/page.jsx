"use client"
import { useState, useEffect, useRef } from "react"
import styles from "./page.module.css"
import jsQR from "jsqr" // Import jsQR library

export default function AdminHome() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState("")
  const [qrKey, setQrKey] = useState("")
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [packagedDate, setPackagedDate] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const startCamera = async () => {
    try {
      setError("")
      setSuccess("")

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsScanning(true)
        scanQRCode()
      }
    } catch (error) {
      setError("Unable to access camera. Please ensure camera permissions are granted.")
      console.error("Camera error:", error)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          handleQRCodeDetected(code.data)
          return
        }
      }

      if (isScanning) {
        requestAnimationFrame(scan)
      }
    }

    requestAnimationFrame(scan)
  }

  const handleQRCodeDetected = (data) => {
    setScannedData(data)

    // Validate QR code format
    const qrPattern = /^https:\/\/qr\.lufta\.in\/product\/(.+)$/
    const match = data.match(qrPattern)

    if (!match) {
      setError("Invalid QR code. QR code must contain a link with format: https://qr.lufta.in/product/<unique-id>")
      stopCamera()
      return
    }

    const extractedQrKey = match[1]
    setQrKey(extractedQrKey)
    setShowForm(true)
    stopCamera()
    setSuccess("QR code scanned successfully!")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validate form data
    if (!selectedProduct || !packagedDate) {
      setError("Please select a product and enter packaged date")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/qr-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          QRKey: qrKey,
          productId: selectedProduct,
          packagedDate: packagedDate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("QR code registered successfully!")
        // Reset form
        setShowForm(false)
        setScannedData("")
        setQrKey("")
        setSelectedProduct("")
        setPackagedDate("")
      } else {
        setError(data.message || "Failed to register QR code")
      }
    } catch (error) {
      setError("Network error. Please try again.")
      console.error("Submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetScanner = () => {
    setShowForm(false)
    setScannedData("")
    setQrKey("")
    setSelectedProduct("")
    setPackagedDate("")
    setError("")
    setSuccess("")
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>QR Code Scanner</h1>

          {error && <div className={styles.error}>{error}</div>}

          {success && <div className={styles.success}>{success}</div>}

          {!isScanning && !showForm && (
            <div className={styles.scannerSection}>
              <button onClick={startCamera} className={styles.primaryButton}>
                Start QR Scanner
              </button>
            </div>
          )}

          {isScanning && (
            <div className={styles.cameraSection}>
              <div className={styles.videoContainer}>
                <video ref={videoRef} className={styles.video} playsInline muted />
                <canvas ref={canvasRef} className={styles.canvas} />
              </div>
              <button onClick={stopCamera} className={styles.secondaryButton}>
                Stop Scanner
              </button>
            </div>
          )}

          {showForm && (
            <div className={styles.formSection}>
              <div className={styles.qrInfo}>
                <h3>QR Code Detected</h3>
                <p>
                  <strong>URL:</strong> {scannedData}
                </p>
                <p>
                  <strong>QR Key:</strong> {qrKey}
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="product" className={styles.label}>
                    Select Product *
                  </label>
                  <select
                    id="product"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className={styles.select}
                    required
                  >
                    <option value="">Choose a product...</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="packagedDate" className={styles.label}>
                    Packaged Date *
                  </label>
                  <input
                    type="date"
                    id="packagedDate"
                    value={packagedDate}
                    onChange={(e) => setPackagedDate(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <button type="submit" disabled={loading} className={styles.primaryButton}>
                    {loading ? "Registering..." : "Register QR Code"}
                  </button>
                  <button type="button" onClick={resetScanner} className={styles.secondaryButton}>
                    Scan Another
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
