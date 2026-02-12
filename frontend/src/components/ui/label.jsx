import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

const Label = React.forwardRef(({ className = "", ...props }, ref) => {
  const baseClasses = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={`${baseClasses} ${className}`.trim()}
      {...props}
    />
  )
})

Label.displayName = "Label"

export { Label }
