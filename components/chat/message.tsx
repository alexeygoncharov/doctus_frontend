import { SimpleAvatar } from "@/components/ui/SimpleAvatar"
import { MessageType } from "@/types/chat"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface MessageProps extends MessageType {
  isLoading?: boolean
}

export function Message({
  role,
  content,
  createdAt,
  userAvatar,
  files,
  isProcessing,
  isLoading
}: MessageProps) {
  return (
    <div className={cn(
      "flex w-full gap-4 p-4",
      role === "user" ? "bg-muted/50" : "bg-background"
    )}>
      <SimpleAvatar 
        src={userAvatar ?? undefined}
        fallbackText={role === "user" ? "Y" : "A"}
        width={32}
        height={32}
        alt={role === "user" ? "Пользователь" : "Ассистент"}
        className={cn(
          isLoading && "animate-pulse"
        )}
      />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            {role === "user" ? "You" : "Assistant"}
          </p>
          {createdAt && (
            <time className="text-xs text-muted-foreground">
              {format(new Date(createdAt), "HH:mm")}
            </time>
          )}
          {isProcessing && (
            <span className="text-xs text-muted-foreground">
              Processing...
            </span>
          )}
        </div>
        <p className="text-sm">
          {content}
        </p>
        {files && files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((file, i) => (
              <div 
                key={i}
                className="flex items-center gap-2 rounded-md bg-muted p-2 text-xs"
              >
                <span>{file.name}</span>
                {file.size && (
                  <span className="text-muted-foreground">
                    ({Math.round(file.size / 1024)}kb)
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 