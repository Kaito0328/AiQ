"use client";

import React from "react";
import { useParams } from "next/navigation";
import { CollectionDetailPageContent } from "@/src/features/collections/components/CollectionDetailPageContent";

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionId = params.collectionId as string;

  return <CollectionDetailPageContent collectionId={collectionId} />;
}
