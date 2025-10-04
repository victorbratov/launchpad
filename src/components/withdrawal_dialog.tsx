import React, { useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from '@/components/ui/shadcn-io/spinner';

interface WithdrawDialogProps {
    accountInfo?: { wallet: number };
    fundsFunction: (amount: number | null) => Promise<void>;
    open: boolean;
    setOpen: (open: boolean) => void;
    withdrawing: boolean;
    setWithdrawing: (withdrawing: boolean) => void;
    withdrawalAmount: number;
    setWithdrawalAmount: (amount: number) => void;
    errorMessage: string;
    setErrorMessage: (message: string) => void;
}

const WithdrawDialog: React.FC<WithdrawDialogProps> = ({ accountInfo, fundsFunction, open, setOpen, withdrawing, setWithdrawing, withdrawalAmount, setWithdrawalAmount, errorMessage, setErrorMessage }) => {
    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                setOpen(isOpen);
                setErrorMessage("");
                if (isOpen) setWithdrawing(false);
            }}
        >
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-800">Withdraw</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {withdrawing ? "Withdrawing Funds" : "Choose an amount to withdraw"}
                    </DialogTitle>
                    <DialogDescription>
                        {withdrawing
                            ? "Please wait while we withdraw your funds ..."
                            : "Please choose an amount to withdraw. This will be transferred to your linked bank account."
                        }
                    </DialogDescription>
                </DialogHeader>

                {!withdrawing ? (
                    <>
                        <p><strong>Balance: ${accountInfo?.wallet ?? 0}</strong></p>
                        <Input
                            type="number"
                            placeholder={`${accountInfo?.wallet ?? 0}`}
                            value={withdrawalAmount === 0 ? "" : withdrawalAmount}
                            onChange={(e) => setWithdrawalAmount(parseFloat(e.target.value))}
                            max={accountInfo?.wallet}
                        />
                        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                        <Button
                            onClick={() => fundsFunction(withdrawalAmount)}
                            className="bg-green-600 hover:bg-green-700 mt-2"
                        >
                            Withdraw Funds
                        </Button>
                    </>
                ) : (
                    <div className="flex justify-center items-center h-24">
                        <Spinner />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default WithdrawDialog;
