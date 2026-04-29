import { useState } from 'react';
import { Drawer } from 'vaul';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const isMobileDevice = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

export default function NativePicker({ value, onValueChange, placeholder, options = [], className }) {
  const [open, setOpen] = useState(false);
  const isMobile = isMobileDevice();
  const selectedLabel = options.find(o => o.value === value)?.label;

  if (!isMobile) {
    return (
      <select
        value={value || ''}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "h-9 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
          className
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className={cn(
            "h-9 w-full flex items-center justify-between px-3 rounded-xl border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring",
            className
          )}
        >
          <span className={cn(selectedLabel ? 'text-foreground' : 'text-muted-foreground')}>
            {selectedLabel || placeholder || 'Select...'}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-[101] bg-background rounded-t-2xl focus:outline-none"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Drawer.Title className="sr-only">{placeholder}</Drawer.Title>
          <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-2" />
          {placeholder && (
            <p className="text-sm font-semibold px-5 py-2 border-b border-border">{placeholder}</p>
          )}
          <div className="overflow-y-auto max-h-72 py-2">
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onValueChange(o.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-5 py-3.5 text-sm hover:bg-secondary active:bg-secondary/80 transition-colors"
              >
                <span>{o.label}</span>
                {value === o.value && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}