import type { Metadata } from "next";
import { DesignSystemGallery } from "./gallery";

export const metadata: Metadata = {
  title: "Design system",
};

export default function DesignSystemPage() {
  return <DesignSystemGallery />;
}
