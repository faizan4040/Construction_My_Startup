import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";


const ButtonLoading = ({ type, text, loading, className, onClick, ...props }) => {
  return (
    <Button
      type={type}
      size="sm"
      variant="outline"
      disabled={loading}
      onClick={onClick}
      className={cn("", className)}
      {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {text}
    </Button>
  );
};

export default ButtonLoading;
