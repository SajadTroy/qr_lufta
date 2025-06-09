// models/QuickResponseCode.js
import mongoose from "mongoose";

const QuickResponseCodeSchema = new mongoose.Schema({
    QRKey: String,
    product: { type: mongoose.Types.ObjectId, ref: 'Product' },
    packagedDate: Date,
});

export default mongoose.models.Product || mongoose.model("QuickResponseCode", QuickResponseCodeSchema);
