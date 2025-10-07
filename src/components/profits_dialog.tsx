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
import { Button } from "@/components/ui/button";
import { declareProfits } from "@/app/business-portal/_actions";
import { FundsDialog } from "@/components/funds_dialog";
import { depositFunds } from "@/app/business-portal/_actions";
import { on } from "events";

interface ProfitDialogProps {
    pitch: BusinessPitch | null;
    open: boolean;
    balance: number;
    onOpenChange: (open: boolean) => void;
    onProfitsDistributed: () => void;
}

export function ProfitsDialog({ pitch, open, balance, onOpenChange, onProfitsDistributed }: ProfitDialogProps) {
    
    const [profitAmount, setProfitAmount] = useState<number | "">(0);
    const [chooseFunds, setChooseFunds] = useState<boolean>(false);
    const [sharedProfit, setSharedProfit] = useState<number>(0);
    const [message, setMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    if (!pitch) return null;
    
    function reportProfits() {
        if (profitAmount === "" || profitAmount <= 0) {
            alert("Please enter a valid profit amount");
            return;
        }
        setChooseFunds(true);
    }

    /**
     * Deposit funds from bank account to platform balance
     */
    async function depositFromBank() {
        try {
            await depositFunds(profitAmount === "" ? 0 : profitAmount);
        } catch (error) {
            console.error("Error depositing from bank:", error);
        }
        UsePlatformBalance();

    }

    async function UsePlatformBalance() {
        if (pitch) {
            try {
                await declareProfits(pitch.pitch_id, sharedProfit, message);
                // reset state and close dialog
                setChooseFunds(false);
                setProfitAmount(0);
                setSharedProfit(0);
                setMessage("");
                onOpenChange(false);
                onProfitsDistributed();
            } catch (error) {
                console.error("Error declaring profits:", error);
                setChooseFunds(false);
                setErrorMessage("Error declaring profits. Please try again.");
            }
        }
    }

    return (

        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{pitch.product_title}</DialogTitle>
                </DialogHeader>
                {!chooseFunds ? (
                    <div>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">It is time to declare profits for this pitch. Please enter your profits.</p>
                            <div className="space-y-2">
                                <Label>Profit Amount ($)</Label>
                                <Input
                                    placeholder="Enter your profit amount"
                                    type="number"
                                    value={profitAmount || ""}
                                    onChange={(e) => {
                                        setProfitAmount(e.target.value === "" ? "" : parseFloat(e.target.value));
                                        setSharedProfit((pitch.investor_profit_share_percent / 100) * (e.target.value === "" ? 0 : parseFloat(e.target.value)));
                                    }}
                                />
                            </div>
                            <div>
                                <p>Investor Profit Share: {pitch.investor_profit_share_percent}%</p>
                                <p>Total being distributed: ${sharedProfit.toFixed(2)}</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Pitch Update Message</Label>
                                <Input
                                    placeholder="Enter a message to update your investors"
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                        </div>
                        {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
                        <DialogFooter className="flex gap-3 justify-end mt-4">
                            <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={reportProfits}>Report Profit</Button>
                        </DialogFooter>
                    </div>
                ) : (
                    profitAmount !== "" && profitAmount > 0 && (
                        <div className="space-y-2">
                            <p className="font-bold">Platform Balance: ${balance.toFixed(2)}</p>
                            <p className="font-bold mb-4">Profits to distribute: ${sharedProfit.toFixed(2)}</p>
                            <p className="mb-4">Where will you distribute profits from?</p>
                            <div className="flex justify-between gap-4">
                                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={depositFromBank}>Linked Bank Account</Button>
                                <Button disabled={balance < sharedProfit} className={`flex-1 ${balance > sharedProfit ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-600 hover:bg-gray-700"} text-white px-4 py-2 rounded`} onClick={UsePlatformBalance}>Platform Balance</Button>
                            </div>
                        </div>
                    )
                )}
            </DialogContent>
        </Dialog>
    );
}