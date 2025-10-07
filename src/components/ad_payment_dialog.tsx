import React, { useEffect, useState } from "react";
import { BusinessPitch } from "@/db/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { depositFunds, makeAdPayment } from "@/app/business-portal/_actions";

interface AdPaymentDialogProps {
    open: boolean;
    balance: number;
    pitch: BusinessPitch | null;
    onOpenChange: (open: boolean) => void;
    onProfitsDistributed: () => void;
}

export const AdPaymentDialog: React.FC<AdPaymentDialogProps> = ({
    open, onOpenChange, balance, pitch, onProfitsDistributed
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [adPaymentAmount, setAdPaymentAmount] = useState<number>(0);

    useEffect(() => {
        setAdPaymentAmount(pitch ? pitch.total_advert_clicks / 100 : 0);
    }, [pitch]);

    /**
     * Deposit funds from bank account to platform balance
     */
    async function depositFromBank() {
        try {
            await depositFunds(pitch ? pitch.total_advert_clicks : 0);
        } catch (error) {
            console.error("Error depositing from bank:", error);
        }
        UsePlatformBalance();
    }

    async function UsePlatformBalance() {
        if (pitch) {
            try {
                await makeAdPayment(pitch.pitch_id, pitch.total_advert_clicks);
                // reset state and close dialog
                setLoading(false);
                onOpenChange(false);
                onProfitsDistributed();
            } catch (error) {
                console.error("Error declaring profits:", error);
                setLoading(false);
                setError("Error declaring profits. Please try again.");
            }
        }
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Ad Payment Required
                    </DialogTitle>
                    <DialogDescription>
                        {loading
                            ? `Please wait while we process your ad payment.`
                            : `Choose your payment method:`
                        }
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center items-center h-24">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <p>
                            <strong>Balance:</strong> £{balance?.toFixed(2)}
                        </p>
                        {error && <p className="text-red-600 mt-1">{error}</p>}

                        <div className="flex justify-between gap-4">
                            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={depositFromBank}>Linked Bank Account</Button>
                            <Button disabled={balance < adPaymentAmount} className={`flex-1 ${balance > adPaymentAmount ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-600 hover:bg-gray-700"} text-white px-4 py-2 rounded`} onClick={UsePlatformBalance}>Platform Balance</Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
