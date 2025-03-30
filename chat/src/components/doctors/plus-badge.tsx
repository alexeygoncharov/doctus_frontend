"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlusBadgeProps {
  className?: string;
}

export function PlusBadge({ className = "" }: PlusBadgeProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`premium-badge bg-green-500 text-white text-[10px] px-1 py-0.5 rounded-sm font-medium cursor-pointer ${className}`}
            onClick={(e) => {
              e.stopPropagation();
              const event = new CustomEvent("showPricing");
              window.dispatchEvent(event);
            }}
          >
            +PLUS
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-black/80">
          <div className="text-xs max-w-[200px]">
            <p>Доступно только для +Plus пользователей.</p>
            <button
              type="button"
              className="block mt-1 text-blue-300 hover:text-blue-200 underline text-left w-full"
              onClick={(e) => {
                e.stopPropagation();
                const event = new CustomEvent("showPricing");
                window.dispatchEvent(event);
              }}
            >
              Оплатить тариф
            </button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}