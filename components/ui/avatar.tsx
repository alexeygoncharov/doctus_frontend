"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import Image from "next/image" // Import next/image

import { cn } from "../../lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    // Ensure width/height styles are applied if not already by className
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    ref={ref}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

// Define props specifically for AvatarImage, adding width and height
// Inherit props from next/image for flexibility, mark required ones
interface AvatarImageProps extends Omit<React.ComponentPropsWithoutRef<typeof Image>, 'alt'> {
  alt: string; // Make alt mandatory for accessibility
}

const AvatarImage = React.forwardRef<
  // Ref type for next/image is HTMLImageElement
  React.ElementRef<"img">,
  AvatarImageProps
>(({ className, src, alt, width = 40, height = 40, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(!src); // Start with error if src is initially missing

  // Update error state if src changes
  React.useEffect(() => {
    setHasError(!src);
  }, [src]);

  // If src is missing or there was an error, render nothing to let Fallback show
  if (hasError) {
    // Returning null allows the Fallback component defined within the Avatar tags to render
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt} // Alt is now mandatory
      width={width}  // Use provided width or default
      height={height} // Use provided height or default
      // Apply necessary classes, ensure aspect ratio and fit
      // Use object-cover to prevent distortion if aspect ratio differs
      className={cn("aspect-square h-full w-full object-cover", className)}
      ref={ref} // Forward the ref
      onError={() => {
        // console.log(`AvatarImage: Error loading ${src}, showing fallback.`);
        setHasError(true); // Set error state to true to hide the image and let fallback show
      }}
      // Reset error state if loading completes successfully
      // Note: onLoadingComplete might still be called on error in some Next.js versions
      onLoadingComplete={(result) => {
        // Check if the image actually loaded (naturalWidth > 0)
        if (result.naturalWidth > 0) {
           setHasError(false); // Reset error state only on successful load
        } else {
           // If naturalWidth is 0, it likely means an error occurred
           // console.log(`AvatarImage: Loading complete but naturalWidth is 0 for ${src}.`);
           setHasError(true);
        }
      }}
      {...props} // Pass remaining props like `priority`, etc.
    />
  )
})
AvatarImage.displayName = "AvatarImage" // Update display name

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  // This component will automatically render if AvatarImage returns null or isn't provided
  <AvatarPrimitive.Fallback
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    ref={ref}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarFallback, AvatarImage }

