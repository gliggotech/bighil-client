"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { complaintTypes } from "@/lib/complaintSchema";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { InfoTooltip } from "../InfoTooltip";

const ComplaintTypeSelector = ({ form }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [pendingValue, setPendingValue] = useState(null);

  return (
    <FormField
      control={form.control}
      name="complaintType"
      render={({ field }) => (
        <FormItem className="space-y-2 mt-6">
          <p className="text-sm flex items-center gap-2 font-medium text-text_color">
            Complaint Type<span className="text-red">*</span>
            <InfoTooltip
              content={
                <>
                  <p className="mb-1 font-medium text-sm text-gray-800">
                    Complaint Types:
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                    <li>
                      <strong>Anonymous:</strong> Your identity will not be
                      shared. Choose this if you prefer confidentiality.
                    </li>
                    <li>
                      <strong>Non-Anonymous:</strong> Your identity will be
                      shared with the appropriate authorities for transparency.
                    </li>
                  </ul>
                </>
              }
            />
          </p>
          <div className="grid grid-cols-2 mt-2">
            {complaintTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    id={type}
                    checked={field.value === type}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        if (type === "Non-Anonymous") {
                          setPendingValue(type);
                          setShowDialog(true);
                        } else {
                          field.onChange(type);
                        }
                      }
                    }}
                  />
                </FormControl>
                <label
                  htmlFor={type}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>

          <FormMessage className="text-xs text-red" />

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Privacy Warning</DialogTitle>
              </DialogHeader>
              <div className="text-sm">
                Your personal information will be disclosed as part of this
                complaint. If you wish to remain discreet, you may file it
                anonymously instead.
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    field.onChange(pendingValue);
                    setShowDialog(false);
                  }}
                >
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </FormItem>
      )}
    />
  );
};

export default ComplaintTypeSelector;
