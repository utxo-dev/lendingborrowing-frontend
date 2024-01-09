import { env } from "@/env.mjs";


const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig = {
  name: "UTXO.dev",
  description:
    "Explore a revolutionary lending and borrowing experience on our Bitcoin platform—unlocking financial possibilities through seamless, secure, and efficient transactions.",
  url: site_url,
  ogImage: `${site_url}/og.jpg`,
  links: {
    twitter: "https://twitter.com/utxolabs",
    // github: "https://github.com/mickasmt/next-saas-stripe-starter",
  },
  mailSupport: "support@utxo.dev"
}