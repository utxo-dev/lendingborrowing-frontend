import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
   
  },
  runtimeEnv: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
   

    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
 
  },
})