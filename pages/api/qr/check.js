import { QuickResponseCode } from '@/models';
import connectDB from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { qr_key } = req.query;

    if (!qr_key || typeof qr_key !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing qr_key' });
    }

    await connectDB();

    const qrCode = await QuickResponseCode.findOne({ QRKey: qr_key });

    if (!qrCode) {
      return res.status(404).json({ exists: false, message: 'QR code not found' });
    }

    return res.status(200).json({
      exists: true,
      qrCode: {
        QRKey: qrCode.QRKey,
        product: qrCode.product,
        packagedDate: qrCode.packagedDate,
        createdAt: qrCode.createdAt,
        updatedAt: qrCode.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error checking QR code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}