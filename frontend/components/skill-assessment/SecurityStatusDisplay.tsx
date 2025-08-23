"use client";

import React from 'react';
import { FaShieldAlt, FaLock, FaEye, FaBan, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface SecurityStatusDisplayProps {
  isActive: boolean;
  violationCount?: number;
  environmentRisk?: 'low' | 'high';
  eyeTrackingActive?: boolean;
}

const SecurityStatusDisplay: React.FC<SecurityStatusDisplayProps> = ({
  isActive,
  violationCount = 0,
  environmentRisk = 'low',
  eyeTrackingActive = false
}) => {
  const securityFeatures = [
    {
      name: 'Page Save Prevention',
      active: isActive,
      icon: <FaLock className="w-4 h-4" />,
      description: 'Blocks Ctrl+S, Save As, MHTML downloads'
    },
    {
      name: 'Context Menu Blocking',
      active: isActive,
      icon: <FaBan className="w-4 h-4" />,
      description: 'Disables right-click menu access'
    },
    {
      name: 'Copy/Paste Prevention',
      active: isActive,
      icon: <FaShieldAlt className="w-4 h-4" />,
      description: 'Blocks clipboard operations'
    },
    {
      name: 'Developer Tools Blocking',
      active: isActive,
      icon: <FaExclamationTriangle className="w-4 h-4" />,
      description: 'Prevents F12, inspect element access'
    },
    {
      name: 'Eye Tracking',
      active: eyeTrackingActive,
      icon: <FaEye className="w-4 h-4" />,
      description: 'Monitors screen attention and focus'
    },
    {
      name: 'Environment Security',
      active: environmentRisk === 'low',
      icon: <FaCheckCircle className="w-4 h-4" />,
      description: 'Verified secure environment'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 right-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg z-50 max-w-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-full ${isActive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
          <FaShieldAlt className={`w-4 h-4 ${isActive ? 'text-green-400' : 'text-gray-400'}`} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Security Status</h3>
          <p className={`text-xs ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
            {isActive ? 'Protected' : 'Inactive'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {securityFeatures.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className={`${feature.active ? 'text-green-400' : 'text-gray-500'}`}>
              {feature.icon}
            </div>
            <div className="flex-1">
              <div className={`font-medium ${feature.active ? 'text-white' : 'text-gray-400'}`}>
                {feature.name}
              </div>
              <div className="text-gray-500 text-xs">
                {feature.description}
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${feature.active ? 'bg-green-400' : 'bg-gray-600'}`} />
          </div>
        ))}
      </div>

      {violationCount > 0 && (
        <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs">
          <div className="flex items-center gap-1">
            <FaExclamationTriangle className="w-3 h-3" />
            <span className="font-medium">{violationCount} violation(s) detected</span>
          </div>
        </div>
      )}

      {environmentRisk === 'high' && (
        <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-400 text-xs">
          <div className="flex items-center gap-1">
            <FaExclamationTriangle className="w-3 h-3" />
            <span className="font-medium">High-risk environment detected</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SecurityStatusDisplay;
