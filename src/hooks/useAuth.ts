"use client";

import { useContext } from "react";
import { AuthContext } from "@/components/providers";

export const useAuth = () => useContext(AuthContext);
