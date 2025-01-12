import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; // Optional label for accessibility
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id, rows = 3, placeholder = 'Type here...', ...props }, ref) => {
    const baseStyles =
      'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    return (
      <>
        {label && <label htmlFor={id} className="sr-only">{label}</label>}
        <textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          className={cn(baseStyles, className)}
          ref={ref}
          {...props}
        />
      </>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };