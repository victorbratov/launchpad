import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

interface FundsDialogProps {
  mode: "deposit" | "withdraw";

  balance: number;

  onSubmit: (amount: number) => Promise<void>;
}

export const FundsDialog: React.FC<FundsDialogProps> = ({
  mode,
  balance,
  onSubmit,
}) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isWithdraw = mode === "withdraw";
  const actionLabel = isWithdraw ? "Withdraw" : "Deposit";
  const color = isWithdraw
    ? "bg-red-600 hover:bg-red-700"
    : "bg-green-600 hover:bg-green-700";

  const handleAction = async () => {
    const numericAmount = typeof amount === "string" ? 0 : amount;
    if (numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (isWithdraw && numericAmount > balance) {
      setError("Insufficient funds.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await onSubmit(numericAmount);
      setOpen(false);
      setAmount("");
    } catch {
      setError(`Failed to ${actionLabel.toLowerCase()}. Try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={color}>{actionLabel}</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {loading
              ? `${actionLabel}ing...`
              : `${actionLabel} Funds`}
          </DialogTitle>
          <DialogDescription>
            {loading
              ? `Please wait while we ${actionLabel.toLowerCase()} your funds.`
              : `Enter an amount to ${actionLabel.toLowerCase()}.${isWithdraw ? " This will go to your linked bank account." : ""
              }`}
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

            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || "")}
            />

            {error && <p className="text-red-600 mt-1">{error}</p>}

            <Button onClick={handleAction} className={`${color} mt-3`}>
              {actionLabel}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
