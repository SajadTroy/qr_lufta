import mongoose from "mongoose";

const QuickResponseCodeSchema = new mongoose.Schema({
    QRKey: { type: String, required: true, unique: true },
    product: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
    packagedDate: { type: Date, required: true },
});

export default mongoose.models.QuickResponseCode || mongoose.model("QuickResponseCode", QuickResponseCodeSchema);
