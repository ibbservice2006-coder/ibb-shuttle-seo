import { useState, useEffect } from "react";
import { supabase } from "@/integrations/ibb/client";
import { useOptionalAuth } from "@/contexts/AuthContext";

export const useDriverRole = () => {
  const { user } = useOptionalAuth();
  const [isDriver, setIsDriver] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDriverRole = async () => {
      if (!user) {
        setIsDriver(false);
        setDriverId(null);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has driver role
        const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "driver",
        });

        if (roleError) {
          console.error("Error checking driver role:", roleError);
          setIsDriver(false);
          setDriverId(null);
        } else if (hasRole) {
          setIsDriver(true);
          
          // Get driver ID from drivers table
          const { data: driverData, error: driverError } = await supabase
            .from("drivers")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (driverError) {
            console.error("Error fetching driver data:", driverError);
          } else {
            setDriverId(driverData?.id || null);
          }
        } else {
          setIsDriver(false);
          setDriverId(null);
        }
      } catch (err) {
        console.error("Error checking driver role:", err);
        setIsDriver(false);
        setDriverId(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkDriverRole();
  }, [user]);

  return { isDriver, driverId, isLoading };
};
