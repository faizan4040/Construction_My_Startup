import connectDb from "@/lib/databaseConnection";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDb()
        const {latitude,longitude,category}=await req.json()
        if(!latitude||!longitude){
            return NextResponse.json(
                {message:"coordinates not found"},
                {status:400}
            )
        }

        const partners=await User.find({
            role:"laber",
            isOnline:true,
            partnerStatus:"approved",
            location:{
                $near:{
                    $geometry:{
                        type:"Point",
                        coordinates:[longitude,latitude]
                    },
                    $maxDistance:10000
                }
            }
        })

        const partnerIds=partners.map(p=>p._id)

        if(partnerIds.length==0){
             return NextResponse.json(
                 [],
                {status:200}
            )
        }

        const labours=await Labour.find({
            owner:{$in:partnerIds},
            category,
            status:"approved",
            isActive:true
        }).lean()

       return NextResponse.json(
                labours,
                {status:200}
            ) 


    } catch (error) {
        return NextResponse.json(
                {message:`near by labour error ${error}`},
                {status:500}
            )
    }
}