"use client";
import { useState } from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X } from "lucide-react";
import priorityMapping from "@/lib/tags";
import { FaQuestion } from "react-icons/fa";
import { InfoTooltip } from "../InfoTooltip";

export function TagSelector({ form }) {
  const [openTags, setOpenTags] = useState(false);

  return (
    <FormField
      control={form.control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-text_color flex items-center gap-1 relative">
            {" "}
            Tags{" "}
            <InfoTooltip content="Tags help identify the nature and urgency of your complaint. Choose tags carefully, as they influence how your complaint is prioritized and handled." />
          </FormLabel>
          <div className="flex flex-wrap gap-2 sm:gap-3 relative">
            {field.value?.map((tag) => (
              <Badge
                key={tag}
                className="bg-primary/20 hover:bg-primary/30  text-text_color font-normal text-xs sm:text-sm py-1 px-1"
              >
                {priorityMapping.find((t) => t.name === tag)?.name || tag}
                <button
                  type="button"
                  onClick={() =>
                    field.onChange(field.value.filter((t) => t !== tag))
                  }
                  className="ml-1  hover:text-red"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-red rounded-full bg-red/30 p-0.5 sm:p-1" />
                </button>
              </Badge>
            ))}

            <Popover open={openTags} onOpenChange={setOpenTags}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-primary sm:text-sm h-7 sm:h-8 border-none bg-white"
                >
                  + Add Tag
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 w-[240px] sm:w-[650px] border border-gray-300 shadow-xl rounded-lg bg-gray-200"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="Search tags..."
                    className="text-sm sm:text-base h-8 w-full pl-4 bg-white text-text_color placeholder:text-text_color/60 focus:ring-0 focus:border-primary/5"
                  />
                  <CommandList className="max-h-[200px] sm:max-h-[300px] overflow-y-auto">
                    <CommandGroup
                      heading="TAGS"
                      className="bg-gray-100 text-text_color divide-y divide-gray-300"
                    >
                      {priorityMapping
                        .filter((tag) => !field.value?.includes(tag.name))
                        .map((tag) => (
                          <CommandItem
                            className="text-xs sm:text-sm py-2 px-3 hover:bg-gray-300 text-nowrap text-text_color cursor-pointer"
                            key={tag.name}
                            value={tag.name}
                            onSelect={() => {
                              const currentTags = field.value || [];
                              field.onChange([...currentTags, tag.name]);
                              setOpenTags(false);
                            }}
                          >
                            {tag.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </FormItem>
      )}
    />
  );
}
