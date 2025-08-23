"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaArrowLeft, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';

const DisqualificationScreen: React.FC<{ assessmentId?: string }> = ({ assessmentId }) => {
  const router = useRouter();
  const [disqualificationReason, setDisqualificationReason] = useState<string>("Academic integrity violation");

  useEffect(() => {
    // Get the reason for disqualification from localStorage if available
    if (assessmentId) {
      const storedReason = localStorage.getItem(`assessment_disqualification_reason_${assessmentId}`);
      if (storedReason) {
        setDisqualificationReason(storedReason);
      }
    } else {
      // Try to get the reason from any assessmentId
      const keys = Object.keys(localStorage);
      const reasonKey = keys.find(key => key.startsWith('assessment_disqualification_reason_'));
      if (reasonKey) {
        const storedReason = localStorage.getItem(reasonKey);
        if (storedReason) {
          setDisqualificationReason(storedReason);
        }
      }
    }
  }, [assessmentId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md"></div>
          <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full">
            <FaExclamationTriangle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mt-4 text-center">Assessment Terminated</h1>
        <div className="w-16 h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full mt-3"></div>
      </div>
      
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 mb-6">
        <div className="flex items-center mb-3">
          <FaShieldAlt className="text-red-400 mr-2" />
          <h3 className="text-md font-semibold text-white">Security Violation Detected</h3>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          {disqualificationReason === "Tab switching detected" ? (
            "You switched to another browser tab during the assessment. Tab switching is not allowed during assessments as it violates the integrity policy."
          ) : disqualificationReason === "Screenshot attempt detected" ? (
            "You attempted to take a screenshot during the assessment. Screenshots are not allowed as they can be used to share assessment content."
          ) : disqualificationReason.includes("Looking away") || disqualificationReason.includes("Face not detected") ? (
            "Our proctoring system detected that you were looking away from the screen or your face was not visible for more than 5 seconds, which violates the assessment integrity policy."
          ) : disqualificationReason.includes("Environment security violation") || disqualificationReason.includes("High-risk environment") ? (
            "Our security system detected changes in your environment during the assessment, such as activation of remote access tools or virtual machines, which violates the assessment integrity policy."
          ) : disqualificationReason.includes("Virtual machine") || disqualificationReason.includes("VMware") || disqualificationReason.includes("VirtualBox") ? (
            "The assessment was terminated because you are using a virtual machine or virtualization software, which is not allowed for security and integrity reasons."
          ) : disqualificationReason.includes("Remote access") || disqualificationReason.includes("remote desktop") ? (
            "The assessment was terminated because remote access or screen sharing software was detected, which violates the assessment security policy."
          ) : (
            "Our proctoring system detected a potential violation of the assessment integrity policy. This could include looking away from the screen, having your face not visible, using external resources, or environment security issues."
          )}
        </p>
      </div>
      
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 mb-6">
        <div className="flex items-center mb-3">
          <FaInfoCircle className="text-blue-400 mr-2" />
          <h3 className="text-md font-semibold text-white">Policy Information</h3>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          To ensure fairness and academic integrity, our system monitors for the following:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
          <li className="flex items-center bg-gray-700/50 rounded-lg p-2.5">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Tab switching
          </li>
          <li className="flex items-center bg-gray-700/50 rounded-lg p-2.5">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Screenshot attempts
          </li>
          <li className="flex items-center bg-gray-700/50 rounded-lg p-2.5">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            Looking away from screen
          </li>
          <li className="flex items-center bg-gray-700/50 rounded-lg p-2.5">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            Face not visible
          </li>
          <li className="flex items-center bg-gray-700/50 rounded-lg p-2.5">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Virtual machines
          </li>
          <li className="flex items-center bg-gray-700/50 rounded-lg p-2.5">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Remote access tools
          </li>
          <li className="flex items-center bg-gray-700/50 rounded-lg p-2.5">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Multiple people detected
          </li>
          <li className="flex items-center bg-gray-700/50 rounded-lg p-2.5">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            External resources used
          </li>
        </ul>
      </div>
      
      <button
        onClick={() => router.push('/skill-assessment')}
        className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20"
      >
        <FaArrowLeft className="w-4 h-4 mr-2" />
        <span>Return to Assessments</span>
      </button>
    </motion.div>
  );
};

export default DisqualificationScreen; 