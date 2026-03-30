"use client";

import { use, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WEBSITE_HOME } from "@/routes/WebsiteRoute";

import { Verified } from "lucide-react";
import { FaFileDownload } from "react-icons/fa";


const EmailVerification = ({ params }) => {
  const { token } = use(params); 
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
       const verify = async () =>{
        const {data: verificationResponse} = await axios.post('/api/auth/verify-email',{token})
        if (verificationResponse.success) {
          setIsVerified(true)
        } else {
          setIsVerified(false)
        }
    }
    verify();
  }, [token]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-96">
        <CardContent className="text-center py-8 space-y-4">
          {isVerified === true && (
            <>
              <Verified size={100} className="mx-auto text-green-500" alt='Verifaication success'/>
              <h1 className="text-2xl font-bold text-green-500" >
                Email verification successful!
              </h1>
            </>
          )}

          {isVerified === false && (
            <>
              <FaFileDownload size={100} className="mx-auto text-red-500" alt='Verifaication error'/>
              <h1 className="text-2xl font-bold text-red-500">
                Email verification failed!
              </h1>
            </>
          )}

          {isVerified !== null && (
            <Button className='hover:bg-orange-500 hover:text-white' asChild>
              <Link href={WEBSITE_HOME}>Continue Shopping</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
