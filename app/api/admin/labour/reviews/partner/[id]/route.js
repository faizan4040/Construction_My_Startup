import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import PartnerBank from "@/models/PartnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";

export async function GET(req, context) {
  try {
    const { isAuth, role } = await isAuthenticated("admin");
    if (!isAuth || role !== "admin") {
      return Response.json({ message: "unauthorized" }, { status: 401 });
    }

    await connectDb();
    const labourId = (await context.params).id;

    const labour = await User.findById(labourId);

    if (!labour || labour.role !== "laber") {
      return Response.json({ message: "labour not found" }, { status: 404 });
    }

    const documents = await PartnerDocs.findOne({ owner: labourId });
    const bank = await PartnerBank.findOne({ owner: labourId });
    const profile = await Labour.findOne({ owner: labourId });

    return Response.json(
      {
        labour,
        documents: documents || null,
        bank: bank || null,
        profile: profile || null,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: `labour get error ${error}` },
      { status: 500 }
    );
  }
}











// import { isAuthenticated } from "@/lib/authentication";
// import connectDb from "@/lib/databaseConnection";
// import PartnerBank from "@/models//PartnerBank.model";
// import PartnerDocs from "@/models/partnerDocs.model";
// import User from "@/models/User.model";

// export async function GET(req, context) {
//     try {
//         const { isAuth, role } = await isAuthenticated("admin");
//         if (!isAuth || role !== "admin") {
//             return Response.json(
//                 { message: "unauthorized" },
//                 { status: 401 }
//             );
//         }

//         await connectDb();
//         const labourId = (await context.params).id;
//         const labour = await User.findById(labourId);

//         if (!labour || labour.role !== "laber") {
//             return Response.json(
//                 { message: "labour not found" },
//                 { status: 404 }
//             );
//         }

//         const documents = await PartnerDocs.findOne({ owner: labourId });
//         const bank = await PartnerBank.findOne({ owner: labourId });

//         return Response.json(
//             {
//                 labour,
//                 documents: documents || null,
//                 bank: bank || null,
//             },
//             { status: 200 }
//         );
//     } catch (error) {
//         return Response.json(
//             { message: `labour get error ${error}` },
//             { status: 500 }
//         );
//     }
// }