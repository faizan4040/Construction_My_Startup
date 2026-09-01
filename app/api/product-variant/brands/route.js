import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ProductVariantModel from "@/models/ProductVariant.model";


export async function GET() {

    try{
        await connectDB()

        const getBrand = await ProductVariantModel.distinct('brand')

        if(!getBrand){
            return response(false, 404, 'Brand not found')
        }

        return response(true, 200, "Brand found.", getBrand)

        
    } catch(error){
        return catchError(error)
    }
}