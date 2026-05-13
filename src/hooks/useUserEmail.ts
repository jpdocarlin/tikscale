import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserEmail = () => {
  // Mock authentication for local development bypass
  const email = "jpnogueiraz@gmail.com";
  const isLoading = false;
  const isAdmin = true;

  return { email, isAdmin, isLoading };
};
