'use client';

import RemoteAccessTest from '@/components/RemoteAccessTest';

export default function RemoteAccessTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Remote Access Detection Test
          </h1>
          <p className="text-gray-600">
            Testing Chrome Remote Desktop and advanced browser-based detection methods
          </p>
        </div>
        
        <RemoteAccessTest />
        
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Detection Methods Implemented:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-blue-800">Screen Sharing API Detection</h3>
              <p className="text-sm text-blue-600 mt-1">
                Monitors getDisplayMedia() usage and MediaStream tracking
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold text-green-800">System Metrics Analysis</h3>
              <p className="text-sm text-green-600 mt-1">
                Color depth, session indicators, performance characteristics
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-semibold text-purple-800">CSS Media Query Detection</h3>
              <p className="text-sm text-purple-600 mt-1">
                Remote session characteristics via @media queries
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <h3 className="font-semibold text-red-800">Chrome Remote Desktop Specific</h3>
              <p className="text-sm text-red-600 mt-1">
                User agent, DOM elements, extension detection
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-semibold text-yellow-800">WebDriver Detection</h3>
              <p className="text-sm text-yellow-600 mt-1">
                Automation tools and Selenium indicators
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded">
              <h3 className="font-semibold text-indigo-800">Virtual Machine Detection</h3>
              <p className="text-sm text-indigo-600 mt-1">
                Hardware fingerprinting and VM signatures
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
