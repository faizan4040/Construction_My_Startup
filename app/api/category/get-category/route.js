import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import CategoryModel from "@/models/Category.model";


export async function GET(request) {

    try{

        await connectDB()

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (id) {
            const category = await CategoryModel.findOne({ _id: id, deletedAt: null }).lean()
            if (!category) {
                return response(false, 404, 'Category not found')
            }
            return response(true, 200, "Category found.", category)
        }

        const getCategory = await CategoryModel.find({deletedAt: null}).lean()

        if(!getCategory){
            return response(false, 404, 'Category not found')
        }

        return response(true, 200, "Category found.", getCategory)


    } catch(error){
        return catchError(error)
    }
}












// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import CategoryModel from "@/models/Category.model";


// export async function GET() {

//     try{
        
//         await connectDB()

//         const getCategory = await CategoryModel.find({deletedAt: null}).lean()

//         if(!getCategory){
//             return response(false, 404, 'Category not found')
//         }

//         return response(true, 200, "Category found.", getCategory)

        
//     } catch(error){
//         return catchError(error)
//     }
// }
