import connectDB from "../../lib/db"
import Product from "../../models/Product"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    await connectDB()
    const products = await Product.find({}).select("_id name").sort({ name: 1 })
    res.status(200).json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ message: "Failed to fetch products" })
  }
}
