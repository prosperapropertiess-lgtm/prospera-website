"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}: React.ComponentProps<typeof DayPicker>): React.ReactElement {
  const defaultComponents = {
    Chevron: ({
      className: chevronClassName,
      orientation,
      ...chevronProps
    }: {
      className?: string;
      orientation?: "left" | "right" | "up" | "down";
    }): React.ReactElement => {
      if (orientation === "left") {
        return <ChevronLeftIcon className={cn("h-4 w-4", chevronClassName)} {...chevronProps} />;
      }
      return <ChevronRightIcon className={cn("h-4 w-4", chevronClassName)} {...chevronProps} />;
    },
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-[#D8D2C8] transition-colors",
        button_next: "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-[#D8D2C8] transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-[#666666] rounded-md w-9 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative",
        day_button: "h-9 w-9 p-0 font-normal inline-flex items-center justify-center rounded-md transition-colors hover:bg-[#F7F5F2] focus:outline-none cursor-pointer",
        selected: "bg-[#8B2030] text-white hover:bg-[#8B2030] rounded-md",
        today: "bg-[#F7F5F2] text-[#222222] font-semibold rounded-md",
        outside: "text-[#D8D2C8] opacity-50",
        disabled: "text-[#D8D2C8] opacity-50 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        ...defaultComponents,
        ...userComponents,
      }}
      {...props}
    />
  );
}
