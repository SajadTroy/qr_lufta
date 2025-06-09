// models/Product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    imageUrl: String,
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
