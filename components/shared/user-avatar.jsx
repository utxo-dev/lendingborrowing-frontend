
import { AvatarProps } from "@radix-ui/react-avatar"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/shared/icons"


export function UserAvatar({ user, ...props }) {
  return (
    <Avatar {...props}>
    
        <AvatarFallback>
          {/* <span className="sr-only">{user.name}</span> */}
          <Icons.user className="size-4" />
        </AvatarFallback>
      
    </Avatar>
  )
}