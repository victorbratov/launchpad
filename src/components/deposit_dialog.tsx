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

interface DepositDialogProps {
    accountInfo?: { wallet: number };
    depositFunds: (amount: number) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    depositing: boolean;
    setDepositing: (depositing: boolean) => void;
    depositAmount: number;
    setDepositAmount: (amount: number) => void;
    errorMessage: string;
    setErrorMessage: (message: string) => void;
}

const DepositDialog: React.FC<DepositDialogProps> = ({ accountInfo, depositFunds, open, setOpen, depositing, setDepositing, depositAmount, setDepositAmount, errorMessage, setErrorMessage }) => {
    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                setOpen(isOpen);
                setErrorMessage("");
                if (isOpen) setDepositing(false);
            }}
        >
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-800">Deposit</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {depositing ? "Depositing Funds" : "Choose an amount to deposit"}
                    </DialogTitle>
                    <DialogDescription>
                        {depositing
                            ? "Please wait while we deposit your funds ..."
                            : "Please choose an amount to deposit. This will be transferred from your linked bank account."
                        }
                    </DialogDescription>
                </DialogHeader>

                {!depositing ? (
                    <>
                        <p><strong>Current Platform Balance: ${accountInfo?.wallet ?? 0}</strong></p>
                        <Input
                            type="number"
                            placeholder="0"
                            value={depositAmount === 0 ? "" : depositAmount}
                            onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
                        />
                        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                        <Button
                            onClick={() => depositFunds(depositAmount)}
                            className="bg-green-600 hover:bg-green-700 mt-2"
                        >
                            Deposit Funds
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

export default DepositDialog;
