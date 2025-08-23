"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaEye, FaTimes, FaCheck, FaWindowMaximize, FaClone, FaShieldAlt } from 'react-icons/fa';
import { MdScreenshot } from 'react-icons/md';

interface ProctorConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const ProctorConsentModal: React.FC<ProctorConsentModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center space-x-4 mb-5">
          <div className="bg-blue-500/10 rounded-full p-3 flex-shrink-0">
            <FaCamera className="text-blue-400 text-xl" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Security Verification
          </h2>
        </div>

        <p className="text-gray-300 text-sm mb-5 leading-relaxed">
          Webcam access required for proctoring to ensure academic integrity.
          Your environment has been verified for security. The following measures are active:
        </p>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-5 overflow-auto max-h-60">
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start">
              <FaEye className="text-blue-400 mt-1 mr-2 flex-shrink-0" />
              <span>Eye tracking monitors screen attention. If you look away from the screen, you will be immediately disqualified</span>
            </li>
            <li className="flex items-start">
              <FaWindowMaximize className="text-yellow-400 mt-1 mr-2 flex-shrink-0" />
              <span>Do not switch tabs on your browser. It will result in immediate disqualification</span>
            </li>
            <li className="flex items-start">
              <MdScreenshot className="text-orange-400 mt-1 mr-2 flex-shrink-0" />
              <span>Taking screenshots is prevented and monitored</span>
            </li>
            <li className="flex items-start">
              <FaClone className="text-purple-400 mt-1 mr-2 flex-shrink-0" />
              <span>You cannot copy or select text. It will be monitored</span>
            </li>
            <li className="flex items-start">
              <FaShieldAlt className="text-cyan-400 mt-1 mr-2 flex-shrink-0" />
              <span>Environment security verified - no virtual machines or remote access detected</span>
            </li>
            
            <li className="flex items-start">
              <FaCheck className="text-green-400 mt-1 mr-2 flex-shrink-0" />
              <span>Your face data is processed locally, not stored</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={onAccept}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <FaCheck className="mr-2 h-3.5 w-3.5" />
            Enable Camera & Continue
          </button>
          <button
            onClick={onDecline}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            Decline (Exit Assessment)
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default ProctorConsentModal; 