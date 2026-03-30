import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import MediaModel from "@/models/Media.model";
import CategoryModel from "@/models/Category.model";
import { response } from "@/lib/helperfunction";
import connectDB from "@/lib/databaseConnection";


function getRandomItems(array, count = 1) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}


function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export async function POST(req) {
    await connectDB();

    try {
      
        const categories = await CategoryModel.find();
        if (categories.length === 0) {
            return response(false, 400, "No categories found!");
        }

        const mediaList = await MediaModel.find();
        const mediaMap = mediaList.map(media => media._id);

        const colors = ["Red", "Blue", "Green", "Black"];
        const sizes = ["UK 6","UK 7","UK 8","UK 9","UK 10","UK 11","UK 12"];
        const genders = ["men", "women", "kids"];

        let products = [];
        let variants = [];

        for (const category of categories) {
            for (let i = 0; i < 5; i++) {
                const mrp = Number(faker.commerce.price(500, 2000, 0));
                const discountPercentage = faker.number.int({ min: 10, max: 50 });
                const sellingPrice = Math.round(mrp - (mrp * discountPercentage) / 100);

                const productId = new mongoose.Types.ObjectId();
                const selectedMedia = getRandomItems(mediaMap, 4);

                const product = {
                    _id: productId,
                    name: faker.commerce.productName(),
                    slug: faker.lorem.slug(),
                    category: category._id,
                    mrp,
                    sellingPrice,
                    discountPercentage,
                    media: selectedMedia,
                    description: faker.commerce.productDescription(),
                    deletedAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                products.push(product);

                // Generate variants for all color x size x gender
                for (const color of colors) {
                    for (const size of sizes) {
                        const gender = getRandomItem(genders);
                        const variantMedia = getRandomItems(mediaMap, 4);

                        variants.push({
                            _id: new mongoose.Types.ObjectId(),
                            product: productId,
                            color,
                            size,
                            gender, // <-- Added gender
                            mrp: product.mrp,
                            sellingPrice: product.sellingPrice,
                            discountPercentage: product.discountPercentage,
                            sku: `${product.slug}-${color}-${size}-${faker.number.int({ min: 1000, max: 9999 })}`,
                            stock: faker.number.int({ min: 10, max: 100 }),
                            media: variantMedia,
                            deletedAt: null,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        });
                    }
                }
            }
        }

        // Insert data into MongoDB
        await ProductModel.insertMany(products);
        await ProductVariantModel.insertMany(variants);

        return response(true, 200, "Fake data with gender generated successfully.");
    } catch (error) {
        return response(false, 500, error.message);
    }
}
