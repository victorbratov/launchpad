import { BusinessPitch } from "@/db/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface ProfitDialogProps {
    pitch: BusinessPitch | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function reportProfit() {
    // if account balance is less than profit amount, prompt to deposit funds
    // else, update pitch with profit amount and next payout date
    // distribute profits to investors based on their share
}

export function ProfitsDialog({ pitch, open, onOpenChange }: ProfitDialogProps) {
    if (!pitch) return null;
    const [profitAmount, setProfitAmount] = useState<number | "">(0);

    return (<Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>{pitch.product_title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">It's time to declare profits for this pitch. Please enter your profits.</p>
                <div>
                    <Label>Profit Amount ($)</Label>
                    <Input
                        placeholder="Enter your profit amount"
                        type="number"
                        value={profitAmount || ""}
                        onChange={(e) => setProfitAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                    />
                </div>
                <div>
                    <Label>Pitch Update Message</Label>
                    <Input
                        placeholder="Enter a message to update your investors"
                        type="text"
                    />
                </div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
                Note: Reporting profits will notify your investors and update their balances accordingly.
            </div>
            <DialogFooter className="flex gap-3 justify-end">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={reportProfit}>Report Profit</button>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
}