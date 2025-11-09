import { useState } from "react";
import { Profile } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { connectWallet, disconnectWallet } from "../util/wallet";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { cn } from "../lib/utils";

export const WalletButton = () => {
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const { address, isPending } = useWallet();
  const { xlm, ...balance } = useWalletBalance();
  const buttonLabel = isPending ? "Loading..." : "Connect";

  if (!address) {
    return (
      <Button onClick={() => void connectWallet()}>
        {buttonLabel}
      </Button>
    );
  }

  // Badge/pill style container matching button design
  const badgeStyle = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold",
    "border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0)]",
    "bg-white text-foreground px-3 py-1.5",
    "transition-all"
  );

  return (
    <>
      <div className="flex flex-row items-center gap-3" style={{ opacity: balance.isLoading ? 0.6 : 1 }}>
        {/* Balance Badge */}
        <div className={badgeStyle}>
          <span>Wallet Balance: {xlm} XLM</span>
        </div>

        {/* Wallet Profile Badge */}
        <div
          className={cn(badgeStyle, "cursor-pointer hover:shadow-[1px_1px_0px_0px_rgba(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px]")}
          onClick={() => setShowDisconnectModal(true)}
        >
          <Profile
            publicAddress={address}
            size="md"
            isShort
          />
        </div>
      </div>

      <Dialog open={showDisconnectModal} onOpenChange={setShowDisconnectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Wallet?</DialogTitle>
            <DialogDescription>
              Connected as{" "}
              <code className="break-all font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {address}
              </code>
              . Do you want to disconnect?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDisconnectModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                void disconnectWallet().then(() =>
                  setShowDisconnectModal(false),
                );
              }}
            >
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
