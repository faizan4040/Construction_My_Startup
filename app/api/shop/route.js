import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import CategoryModel from "@/models/Category.model";
import ProductModel from "@/models/Product.model";


export async function GET(request) {

    try{
       
     await connectDB()
       
     const searchParams = request.nextUrl.searchParams

     const size = searchParams.get('size')
     const color = searchParams.get('color')
     const gender = searchParams.get('gender')   
     const minPrice = parseInt(searchParams.get('minPrice')) || 0
     const maxPrice = parseInt(searchParams.get('maxPrice')) || 100000
     const categorySlug = searchParams.get('category')
     const search = searchParams.get('q')

     const limit = parseInt(searchParams.get('limit')) || 9
     const page = parseInt(searchParams.get('page')) || 0
     const skip = page * limit

     const sortOption = searchParams.get('sort') || 'default_sorting'
     let sortquery = {}
     if (sortOption === 'default_sorting') sortquery = { createdAt: -1 }
     if (sortOption === 'asc') sortquery = { name: 1 }
     if (sortOption === 'desc') sortquery = { name: -1 }
     if (sortOption === 'price_low_high') sortquery = { sellingPrice: 1 }
     if (sortOption === 'price_high_low') sortquery = { sellingPrice: -1 }

     let categoryId = []
     if(categorySlug){
         const slugs = categorySlug.split(',')
         const categoryData = await CategoryModel.find({ deletedAt: null, slug: { $in: slugs } }).select('_id').lean()
         categoryId = categoryData.map(category => category._id)
     }

     // matchStage only has fields that exist on Product model
     // Gender is on variants — do NOT put it here
     let matchStage = {}
     if(categoryId.length > 0) matchStage.category = { $in: categoryId }
     if(search) matchStage.name = { $regex: search, $options: 'i' }

     const products = await ProductModel.aggregate([
        
         { $match: matchStage },
         { $sort: sortquery },
         { $skip: skip },
         { $limit: limit + 1 },

         {
           $lookup: {
             from: 'productvariants',
             localField: '_id',
             foreignField: 'product',
             as: 'variants'
           }
         },

         // gender filter applied here on variants (where it actually lives)
         {
           $addFields: {
             variants: {
               $filter: {
                 input: "$variants",
                 as: "variant",
                 cond: {
                   $and: [
                     size   ? { $in: ["$$variant.size",   size.split(',')]   } : { $literal: true },
                     color  ? { $in: ["$$variant.color",  color.split(',')]  } : { $literal: true },
                     gender ? { $eq: ["$$variant.gender", gender] }            : { $literal: true },
                     { $gte: ["$$variant.sellingPrice", minPrice] },
                     { $lte: ["$$variant.sellingPrice", maxPrice] },
                   ],
                 },
               },
             },
           },
         },

         
         {
           $match: {
             $expr: { $gt: [{ $size: "$variants" }, 0] }
           }
         },

         {
           $lookup: {
             from: 'media',
             localField: 'media',
             foreignField: '_id',
             as: 'media'
           }
         },

         {
           $project: {
             _id: 1,
             name: 1,
             slug: 1,
             mrp: 1,
             sellingPrice: 1,
             discountPercentage: 1,
             media: {
               _id: 1,
               secure_url: 1,
               alt: 1
             },
             variants: {
               color: 1,
               size: 1,
               gender: 1,
               mrp: 1,
               sellingPrice: 1,
               discountPercentage: 1,
             }
           }
         }
     ])

     let nextPage = null
     if(products.length > limit){
        nextPage = page + 1
        products.pop()
     }

     return response(true, 200, 'Product data found', { products, nextPage })

    } catch(error){
        return catchError(error)
    }
}















// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import CategoryModel from "@/models/Category.model";
// import ProductModel from "@/models/Product.model";


// export async function GET(request) {

//     try{
       
//      await connectDB()
       
//      const searchParams = request.nextUrl.searchParams

//      //get filter from query params
//      const size = searchParams.get('size')
//      const color = searchParams.get('color')
//      const gender = searchParams.get('gender')
//      const minPrice = parseInt(searchParams.get('minPrice')) || 0
//      const maxPrice = parseInt(searchParams.get('maxPrice')) || 100000
//      const categorySlug = searchParams.get('category')
//      const search = searchParams.get('q')


//      // pagination
//      const limit = parseInt(searchParams.get('limit')) || 9
//      const page = parseInt(searchParams.get('page')) || 0
//      const skip = page * limit


//      // sorting
//      const sortOption = searchParams.get('sort') || 'default_sorting'
//      let sortquery = {}
//      if (sortOption === 'default_sorting') sortquery = { createdAt: -1 }
//      if (sortOption === 'asc') sortquery = { name: 1 }
//      if (sortOption === 'desc') sortquery = { name: -1 }
//      if (sortOption === 'price_low_high') sortquery = { sellingPrice: 1 }
//      if (sortOption === 'price_high_low') sortquery = { sellingPrice: -1 }


//      // find category by size
//     let categoryId = []
//     if(categorySlug){
//         const slugs = categorySlug.split(',')
//         const categoryData = await CategoryModel.find({deletedAt: null, slug: { $in: slugs } }).select('_id').lean()
//         categoryId = categoryData.map(category => category._id)
//     }
 

//     // match stage
//     let matchStage = {}
//     if(categoryId.length > 0) matchStage.category = { $in: categoryId } // filter by category

//     if (gender) {
//         matchStage.gender = gender   // men | women | kids
//     }

//     if(search){
//         matchStage.name = { $regex: search, $options: 'i' }
//     }


//     // aggreagation pipeline
//     const products = await ProductModel.aggregate([
       
//         {$match: matchStage},
//         {$sort: sortquery},
//         {$skip: skip},
//         {$limit: limit + 1},
//         {
//           $lookup:{
//             from: 'productvariants',
//             localField: '_id',
//             foreignField: 'product',
//             as: 'variants'
//           }
//         },
//         {
//             $addFields: {
//                 variants: {
//                 $filter: {
//                     input: "$variants",
//                     as: "variant", 
//                     cond: {
//                         $and: [
//                             size ? { $in: ["$$variant.size", size.split(',')] } : { $literal: true },
//                             color ? { $in: ["$$variant.color", color.split(',')] } : { $literal: true },
//                             gender ? { $in: ["$$variant.gender", gender.split(',')] } : { $literal: true },
//                             { $gte: ["$$variant.sellingPrice", minPrice] },
//                             { $lte: ["$$variant.sellingPrice", maxPrice] },
//                         ],
//                     },
//                   },
//                 },
//               },
//             },
//             {
//                $match:{
//                 variants: { $ne: []}
//                }
//             },
//         {
//           $lookup:{
//             from: 'media',
//             localField: 'media',
//             foreignField: '_id',
//             as: 'media'
//           }
//         },
//         {
//             $project:{
//                 _id: 1,
//                 name: 1,
//                 slug: 1,
//                 mrp: 1,
//                 sellingPrice: 1,
//                 discountPercentage: 1,
//                 media:{
//                     _id: 1,
//                     secure_url: 1,
//                     alt: 1
//                 },
//                 variants: {
//                     color: 1,
//                     size: 1,
//                     gender: 1,
//                     mrp: 1,
//                     sellingPrice: 1,
//                     discountPercentage: 1,
//                 }
//             }
//         }
//     ])




//     // check if more data exists
//     let nextPage = null
//     if(products.length > limit){
//        nextPage = page + 1
//        products.pop() // remove extra item
//     }

//     return response(true, 200, 'Product data fount', { products, nextPage })


//     } catch(error){
//         return catchError(error)
//     }
// }