import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl font-black gradient-text mb-4"
        >
          404
        </motion.h1>
        <p className="text-xl font-semibold text-foreground mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button className="gradient-bg border-0 text-primary-foreground gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Return Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
