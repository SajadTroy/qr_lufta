import { Product } from '@/models';
import connectDB from '@/lib/db';

export default async function GET(req) {
    try {
        await connectDB()

        const product = new Product({
            name: "Lufta Protein Bar",
            description: "Healthy protein snack",
            imageUrl: "https://example.com/images/protein-bar.jpg",
            long:
                "Lufta Protein Bar is made with oats, almonds, and whey protein. Great for workouts and daily energy.",
            nutritionalTable: `
      <table border="1">
        <tr><th>Nutrient</th><th>Amount</th></tr>
        <tr><td>Energy</td><td>450 kcal</td></tr>
        <tr><td>Protein</td><td>25g</td></tr>
        <tr><td>Fat</td><td>18g</td></tr>
        <tr><td>Carbs</td><td>40g</td></tr>
        <tr><td>Fiber</td><td>12g</td></tr>
      </table>
    `,
        });

        await product.save();
        console.log("Product inserted successfully ✅");

        const products = await Product.find().select('name _id');

        return new Response(JSON.stringify(products), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}