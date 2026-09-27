import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import CategoryModel from "@/models/Category.model";
import { NextResponse } from "next/server";

const getParentId = (cat) => (cat?.parent ? String(cat.parent) : null);

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const filters = JSON.parse(searchParams.get("filters") || "[]");
    const globalFilter = (searchParams.get("globalFilter") || "").trim().toLowerCase();
    const sorting = JSON.parse(searchParams.get("sorting") || "[]");
    const deleteType = searchParams.get("deleteType");

    // Categories bahut kam hote hain, isliye sab fetch karke tree yahin banate hain.
    const all = await CategoryModel.find({})
      .select("name slug parent createdAt updatedAt deletedAt")
      .lean();

    // parent ka naam (deleted parent ka bhi) dikhane ke liye
    const nameById = new Map(all.map((c) => [String(c._id), c.name]));

    // Trash view (PD) me deleted, warna active
    const items = all.filter((c) => (deleteType === "PD" ? !!c.deletedAt : !c.deletedAt));
    const itemIds = new Set(items.map((c) => String(c._id)));

    // ---------- Search / column filters ----------
    const matches = (c) => {
      if (
        globalFilter &&
        !(c.name.toLowerCase().includes(globalFilter) || c.slug.toLowerCase().includes(globalFilter))
      ) {
        return false;
      }
      for (const f of filters) {
        if (["name", "slug"].includes(f?.id) && f?.value) {
          if (!String(c[f.id]).toLowerCase().includes(String(f.value).toLowerCase())) return false;
        }
      }
      return true;
    };

    const includedIds = new Set();
    items.filter(matches).forEach((c) => {
      includedIds.add(String(c._id));
      // sub-category match ho to uska parent bhi dikhao (context ke liye)
      const p = getParentId(c);
      if (p && itemIds.has(p)) includedIds.add(p);
    });
    const visible = items.filter((c) => includedIds.has(String(c._id)));

    // ---------- Sorting (roots aur children dono par lagta hai) ----------
    const allowedSort = ["name", "slug", "createdAt", "updatedAt"];
    const activeSort = sorting.find((s) => allowedSort.includes(s?.id));
    const key = activeSort ? activeSort.id : "createdAt";
    const dir = activeSort ? (activeSort.desc ? -1 : 1) : -1;

    const cmp = (a, b) => {
      if (key === "createdAt" || key === "updatedAt") {
        return (new Date(a[key]) - new Date(b[key])) * dir;
      }
      return String(a[key]).localeCompare(String(b[key]), undefined, { sensitivity: "base" }) * dir;
    };

    // ---------- Tree: parent -> children ----------
    const visibleIds = new Set(visible.map((c) => String(c._id)));
    const childrenMap = new Map();
    const roots = [];

    visible.forEach((c) => {
      const p = getParentId(c);
      if (p && visibleIds.has(p)) {
        if (!childrenMap.has(p)) childrenMap.set(p, []);
        childrenMap.get(p).push(c);
      } else {
        roots.push(c); // top-level (ya aisi sub-category jiska parent trash me hai)
      }
    });

    // Filter se bahar wale bachchon ko mila kar total sub-category count
    const totalChildren = new Map();
    items.forEach((c) => {
      const p = getParentId(c);
      if (p) totalChildren.set(p, (totalChildren.get(p) || 0) + 1);
    });

    const shape = (c) => {
      const p = getParentId(c);
      return {
        _id: c._id,
        name: c.name,
        slug: c.slug,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        deletedAt: c.deletedAt,
        parent: p ? { _id: p, name: nameById.get(p) || null } : null,
        childrenCount: totalChildren.get(String(c._id)) || 0,
      };
    };

    const rows = [];
    roots.sort(cmp).forEach((root) => {
      rows.push(shape(root));
      (childrenMap.get(String(root._id)) || []).sort(cmp).forEach((child) => rows.push(shape(child)));
    });

    return NextResponse.json({
      success: true,
      data: rows.slice(start, start + size),
      meta: { totalRowCount: rows.length },
    });
  } catch (error) {
    return catchError(error);
  }
}














// import { isAuthenticated } from "@/lib/authentication";
// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import CategoryModel from "@/models/Category.model";
// import { NextResponse } from "next/server";


// export async function GET(request) {
//   try {
//     const auth = await isAuthenticated("admin");
//     if (!auth.isAuth) {
//       return response(false, 403, "Unauthorized.");
//     }

//     await connectDB();

//     // FIXED searchParams
//     const { searchParams } = new URL(request.url);

//     const start = parseInt(searchParams.get("start") || "0", 10);
//     const size = parseInt(searchParams.get("size") || "10", 10);
//     const filters = JSON.parse(searchParams.get("filters") || "[]");
//     const globalFilter = searchParams.get("globalFilter") || "";
//     const sorting = JSON.parse(searchParams.get("sorting") || "[]");
//     const deleteType = searchParams.get("deleteType");

//     //  Default match
//     let matchQuery = { deletedAt: null };

//     if (deleteType === "PD") {
//       matchQuery = { deletedAt: { $ne: null } };
//     }

//     //  Global search
//     if (globalFilter) {
//       matchQuery.$or = [
//         { name: { $regex: globalFilter, $options: "i" } },
//         { slug: { $regex: globalFilter, $options: "i" } },
//       ];
//     }

//     //  Column filters (safe)
//     filters.forEach((filter) => {
//       if (filter?.id && filter?.value) {
//         matchQuery[filter.id] = {
//           $regex: filter.value,
//           $options: "i",
//         };
//       }
//     });

//     //  Sorting
//     let sortQuery = { createdAt: -1 };
//     if (sorting.length) {
//       sortQuery = {};
//       sorting.forEach((sort) => {
//         sortQuery[sort.id] = sort.desc ? -1 : 1;
//       });
//     }

//     const data = await CategoryModel.aggregate([
//       { $match: matchQuery },
//       { $sort: sortQuery },
//       { $skip: start },
//       { $limit: size },
//       {
//         $project: {
//           name: 1,
//           slug: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           deletedAt: 1,
//         },
//       },
//     ]);

//     const totalRowCount = await CategoryModel.countDocuments(matchQuery);

//     return NextResponse.json({
//       success: true,
//       data,
//       meta: { totalRowCount },
//     });
//   } catch (error) {
//     return catchError(error);
//   }
// }
