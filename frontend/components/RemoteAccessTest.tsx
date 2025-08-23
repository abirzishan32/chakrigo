'use client';

import React from 'react';
import { useRemoteAccessDetection } from '@/hooks/useRemoteAccessDetection';

const RemoteAccessTest: React.FC = () => {
  const { detectionResult, isLoading, rerunDetection, getSecurityReport } = useRemoteAccessDetection();

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-900 text-white rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="mt-2">Running security detection...</p>
      </div>
    );
  }

  if (!detectionResult) {
    return (
      <div className="p-6 bg-red-900 text-white rounded-lg">
        <p>Detection failed to initialize</p>
        <button 
          onClick={rerunDetection}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          Retry Detection
        </button>
      </div>
    );
  }

  const securityReport = getSecurityReport();

  return (
    <div className="space-y-6 p-6 bg-gray-900 text-white rounded-lg">
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold mb-4">Remote Access Detection Results</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`p-3 rounded ${detectionResult.isRemoteAccess ? 'bg-red-800' : 'bg-green-800'}`}>
            <p className="font-semibold">Remote Access</p>
            <p className={detectionResult.isRemoteAccess ? 'text-red-200' : 'text-green-200'}>
              {detectionResult.isRemoteAccess ? 'DETECTED' : 'Not Detected'}
            </p>
          </div>
          
          <div className={`p-3 rounded ${detectionResult.chromeRemoteDesktop ? 'bg-red-800' : 'bg-green-800'}`}>
            <p className="font-semibold">Chrome Remote Desktop</p>
            <p className={detectionResult.chromeRemoteDesktop ? 'text-red-200' : 'text-green-200'}>
              {detectionResult.chromeRemoteDesktop ? 'DETECTED' : 'Not Detected'}
            </p>
          </div>
          
          <div className={`p-3 rounded ${detectionResult.isScreenSharing ? 'bg-red-800' : 'bg-green-800'}`}>
            <p className="font-semibold">Screen Sharing</p>
            <p className={detectionResult.isScreenSharing ? 'text-red-200' : 'text-green-200'}>
              {detectionResult.isScreenSharing ? 'ACTIVE' : 'Not Active'}
            </p>
          </div>
          
          <div className={`p-3 rounded ${detectionResult.isVirtualMachine ? 'bg-yellow-800' : 'bg-green-800'}`}>
            <p className="font-semibold">Virtual Machine</p>
            <p className={detectionResult.isVirtualMachine ? 'text-yellow-200' : 'text-green-200'}>
              {detectionResult.isVirtualMachine ? 'DETECTED' : 'Not Detected'}
            </p>
          </div>
        </div>
      </div>

      {securityReport && (
        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-lg font-semibold mb-3">Security Report</h3>
          <div className={`p-4 rounded mb-4 ${
            securityReport.riskLevel === 'HIGH' ? 'bg-red-800' :
            securityReport.riskLevel === 'MEDIUM' ? 'bg-yellow-800' : 'bg-green-800'
          }`}>
            <p className="font-bold">Risk Level: {securityReport.riskLevel}</p>
            <p className="text-sm mt-1">{securityReport.recommendation}</p>
          </div>
          
          {securityReport.threats.length > 0 && (
            <div className="mb-3">
              <h4 className="font-semibold text-red-400">Threats:</h4>
              <ul className="list-disc list-inside text-red-200">
                {securityReport.threats.map((threat, index) => (
                  <li key={index}>{threat}</li>
                ))}
              </ul>
            </div>
          )}
          
          {securityReport.warnings.length > 0 && (
            <div className="mb-3">
              <h4 className="font-semibold text-yellow-400">Warnings:</h4>
              <ul className="list-disc list-inside text-yellow-200">
                {securityReport.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {securityReport.info.length > 0 && (
            <div className="mb-3">
              <h4 className="font-semibold text-blue-400">Information:</h4>
              <ul className="list-disc list-inside text-blue-200">
                {securityReport.info.map((info, index) => (
                  <li key={index}>{info}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Detection Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Platform:</strong> {detectionResult.detectionDetails.platform}</p>
            <p><strong>Screen Resolution:</strong> {detectionResult.detectionDetails.screenResolution}</p>
            <p><strong>Color Depth:</strong> {detectionResult.detectionDetails.colorDepth}</p>
            <p><strong>Timezone:</strong> {detectionResult.detectionDetails.timezone}</p>
          </div>
          <div>
            <p><strong>WebDriver:</strong> {detectionResult.detectionDetails.webdriver ? 'Yes' : 'No'}</p>
            <p><strong>Remote Desktop:</strong> {detectionResult.detectionDetails.remoteDesktop ? 'Yes' : 'No'}</p>
            <p><strong>Virtual Environment:</strong> {detectionResult.detectionDetails.virtualEnvironment ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        {detectionResult.detectionDetails.chromeRemoteDesktopIndicators.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Chrome Remote Desktop Indicators:</h4>
            <div className="bg-gray-800 p-3 rounded text-xs">
              {detectionResult.detectionDetails.chromeRemoteDesktopIndicators.map((indicator, index) => (
                <div key={index} className="mb-1">• {indicator}</div>
              ))}
            </div>
          </div>
        )}
        
        {detectionResult.detectionDetails.sessionIndicators.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Session Indicators:</h4>
            <div className="bg-gray-800 p-3 rounded text-xs">
              {detectionResult.detectionDetails.sessionIndicators.map((indicator, index) => (
                <div key={index} className="mb-1">• {indicator}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-700">
        <button 
          onClick={rerunDetection}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Run Detection Again
        </button>
      </div>
    </div>
  );
};

export default RemoteAccessTest;
