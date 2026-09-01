import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { zSchema } from "@/lib/zodSchema";
import CategoryModel from "@/models/Category.model";


export async function PUT(request){
    try{
      const auth = await isAuthenticated('admin')
      if(!auth.isAuth){
        return response(false, 403, 'Unauthorized.')
      }

      await connectDB()
      const payload = await request.json()
   
      const schema = zSchema.pick({
        _id: true, name: true, slug: true
      }) 

      const validate = schema.safeParse(payload)
      if(!validate.success){
        return response(false, 400, 'Invalid or missing fields.', validate.error)
      }

      const { _id, name, slug} = validate.data
      // parent isn't in zSchema, so read it directly from the payload.
      // undefined (field not sent) vs null (explicitly "make this top-level")
      // are treated the same here — both mean "no parent".
      const parent = payload.parent || null

      const getCategory = await CategoryModel.findOne({deletedAt: null, _id})
      if(!getCategory){
        return response(false, 404, 'Data not found.')
      }

      // a category can't be made its own parent
      if(parent && String(parent) === String(_id)){
        return response(false, 400, 'A category cannot be its own parent.')
      }

      // Case-insensitive duplicate check, scoped to the same parent,
      // excluding this category itself.
      const existing = await CategoryModel.findOne({
        _id: { $ne: _id },
        parent: parent,
        deletedAt: null,
        $or: [
          { name: { $regex: `^${name.trim()}$`, $options: 'i' } },
          { slug: slug.trim().toLowerCase() },
        ],
      })

      if(existing){
        return response(false, 409, parent
          ? 'A subcategory with this name already exists under the selected category.'
          : 'A category with this name already exists.')
      }

      getCategory.name = name
      getCategory.slug = slug
      getCategory.parent = parent
      await getCategory.save()


     
      return response(true, 200, 'Category updated successfully.')


    }catch(error){
      return catchError(error)
    }
}



















// import { isAuthenticated } from "@/lib/authentication";
// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import { zSchema } from "@/lib/zodSchema";
// import CategoryModel from "@/models/Category.model";


// export async function PUT(request){
//     try{
//       const auth = await isAuthenticated('admin')
//       if(!auth.isAuth){
//         return response(false, 403, 'Unauthorized.')
//       }

//       await connectDB()
//       const payload = await request.json()
   
//       const schema = zSchema.pick({
//         _id: true, name: true, slug: true
//       }) 

//       const validate = schema.safeParse(payload)
//       if(!validate.success){
//         return response(false, 400, 'Invalid or missing fields.', validate.error)
//       }

//       const { _id, name, slug} = validate.data

//       const getCategory = await CategoryModel.findOne({deletedAt: null, _id})
//       if(!getCategory){
//         return response(false, 404, 'Data not found.')
//       }

//       getCategory.name = name
//       getCategory.slug = slug
//       await getCategory.save()


     
//       return response(true, 200, 'Category updated successfully.')


//     }catch(error){
//       return catchError(error)
//     }
// }