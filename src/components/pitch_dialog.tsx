"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BusinessPitch } from "@/db/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PitchDialogProps {
  pitch: BusinessPitch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PitchDialog({ pitch, open, onOpenChange }: PitchDialogProps) {
  if (!pitch) return null;

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{pitch.product_title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-8">{pitch.detailed_pitch}</p>
            <div>
              <p><strong>Goal:</strong> ${pitch.target_investment_amount}</p>
              <p><strong>Raised:</strong> ${pitch.raised_amount}</p>
              <p><strong>Profit Share:</strong> {pitch.investor_profit_share_percent}%</p>
              <p><strong>Dividend Period:</strong> {pitch.dividend_payout_period}</p>
              <p><strong>Funding End:</strong> {pitch.end_date.toDateString()}</p>
              <p><strong>Advertising Budget Remaining:</strong> ${pitch.adverts_available / 100}</p>
            </div>
          </div>
          <DialogFooter className="flex gap-3 justify-end">
            <Link href={`/business-portal/${pitch.pitch_id}`}>
              <Button variant="outline">Edit Pitch</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
