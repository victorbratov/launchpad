import { Info } from "lucide-react";

interface InfoTooltipProps {
  message: string;
}

export function InfoBubble({ message }: InfoTooltipProps) {
  return (
    <div className="relative group">
      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
      <div className="invisible group-hover:visible absolute z-50 w-80 p-3 text-sm bg-popover border rounded-md shadow-md left-6 top-0">
        {message}
      </div>
    </div>
  );
}