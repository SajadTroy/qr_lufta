import connectDB from '@/lib/db';
import { QuickResponseCode } from '@/models'; // Adjust path to your model

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectDB();

        const { QRKey, product, packagedDate } = req.body;

        // Validate input
        if (!QRKey || !product || !packagedDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if QRKey already exists
        const existingQr = await QuickResponseCode.findOne({ QRKey });
        if (existingQr) {
            return res.status(409).json({ error: 'QR code already exists' });
        }

        // Create new QR code
        const qrCode = await QuickResponseCode.create({
            QRKey,
            product,
            packagedDate: new Date(packagedDate),
        });

        return res.status(201).json({
            message: 'QR code created successfully',
            qrCode: {
                QRKey: qrCode.QRKey,
                product: qrCode.product,
                packagedDate: qrCode.packagedDate,
                createdAt: qrCode.createdAt,
                updatedAt: qrCode.updatedAt,
            },
        });
    } catch (error) {
        console.error('Error creating QR code:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}