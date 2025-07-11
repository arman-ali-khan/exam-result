'use client';

import { useState, useEffect } from 'react';
import { Wallet, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function WalletStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Simulate wallet connection for demo
  const connectWallet = async () => {
    setIsConnecting(true);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock wallet address
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
    setAddress(mockAddress);
    setIsConnected(true);
    setIsConnecting(false);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="wallet-status wallet-connected">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="font-mono text-sm text-green-600">
            {formatAddress(address)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnectWallet}
          className="text-xs text-green-600 hover:text-green-700 p-1 h-auto"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={connectWallet}
      disabled={isConnecting}
      className="wallet-status wallet-disconnected gap-2"
    >
      {isConnecting ? (
        <>
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm">Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4" />
          <span className="font-mono text-sm">Connect Wallet</span>
        </>
      )}
    </Button>
  );
}