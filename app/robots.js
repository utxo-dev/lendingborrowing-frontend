import { MetadataRoute } from "next"

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
  }
}