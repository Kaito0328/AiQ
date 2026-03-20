"use client";

import React from "react";
import { useParams } from "next/navigation";
import { UserProfilePageContent } from "@/src/features/users/components/UserProfilePageContent";

export default function UserPage() {
  const params = useParams();
  const userId = params.userId as string;

  return <UserProfilePageContent userId={userId} />;
}
