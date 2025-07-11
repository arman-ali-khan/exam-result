'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap } from 'lucide-react';

export function BlockchainIndicator() {
  const [blockHeight, setBlockHeight] = useState(18750432);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'syncing' | 'offline'>('online');

  useEffect(() => {
    // Simulate blockchain updates
    const interval = setInterval(() => {
      setBlockHeight(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (networkStatus) {
      case 'online': return 'text-cyan-400';
      case 'syncing': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
    }
  };

  const getStatusIcon = () => {
    switch (networkStatus) {
      case 'online': return <Activity className="w-3 h-3" />;
      case 'syncing': return <Zap className="w-3 h-3 animate-pulse" />;
      case 'offline': return <Activity className="w-3 h-3 opacity-50" />;
    }
  };

  return (
    <div className="blockchain-indicator">
      {getStatusIcon()}
      <span className="font-mono text-xs">
        BLOCK #{blockHeight.toLocaleString()}
      </span>
      <div className={`w-2 h-2 rounded-full ${getStatusColor().replace('text-', 'bg-')} animate-pulse`} />
    </div>
  );
}