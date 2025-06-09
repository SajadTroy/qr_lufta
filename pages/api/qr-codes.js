import connectDB from "../../lib/db"
import QuickResponseCode from "../../models/QuickResponseCode"
import Product from "../../models/Product"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    await connectDB()

    const { QRKey, productId, packagedDate } = req.body

    // Validate required fields
    if (!QRKey || !productId || !packagedDate) {
      return res.status(400).json({
        message: "QR Key, Product ID, and Packaged Date are required",
      })
    }

    // Validate date
    const parsedDate = new Date(packagedDate)
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" })
    }

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(400).json({ message: "Product not found" })
    }

    // Check if QRKey already exists
    const existingQR = await QuickResponseCode.findOne({ QRKey })
    if (existingQR) {
      return res.status(409).json({
        message: "QR ID already exists. Please use another QR code.",
      })
    }

    // Create new QR code entry
    const newQRCode = new QuickResponseCode({
      QRKey,
      product: productId,
      packagedDate: parsedDate,
    })

    await newQRCode.save()

    res.status(201).json({
      message: "QR code registered successfully",
      qrCode: newQRCode,
    })
  } catch (error) {
    console.error("Error saving QR code:", error)
    res.status(500).json({ message: "Failed to save QR code" })
  }
}
