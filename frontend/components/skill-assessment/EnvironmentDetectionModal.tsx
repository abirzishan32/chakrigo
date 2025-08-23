import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Monitor, Server } from 'lucide-react';

interface EnvironmentDetectionModalProps {
  isOpen: boolean;
  onProceed: () => void;
  onCancel: () => void;
  detectionResult: {
    isRemoteAccess: boolean;
    isVirtualMachine: boolean;
    detectionDetails: any;
  };
}

export const EnvironmentDetectionModal: React.FC<EnvironmentDetectionModalProps> = ({
  isOpen,
  onProceed,
  onCancel,
  detectionResult
}) => {
  const { isRemoteAccess, isVirtualMachine, detectionDetails } = detectionResult;
  
  const hasSecurityConcerns = isRemoteAccess || isVirtualMachine;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${hasSecurityConcerns ? 'bg-red-100' : 'bg-green-100'}`}>
              {hasSecurityConcerns ? (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              ) : (
                <Shield className="h-6 w-6 text-green-600" />
              )}
            </div>
            <DialogTitle className={`text-xl font-semibold ${hasSecurityConcerns ? 'text-red-800' : 'text-green-800'}`}>
              Environment Security Check
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 mt-4">
            <div className="space-y-4">
              {hasSecurityConcerns ? (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-medium text-red-800 mb-2">Security Concerns Detected</h3>
                  <p className="text-sm text-red-700">
                    We've detected that you may be using a virtual machine or remote access tool. 
                    This could compromise the integrity of the assessment.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-800 mb-2">Environment Verified</h3>
                  <p className="text-sm text-green-700">
                    Your environment appears to be secure and suitable for the assessment.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Remote Access Detection */}
                <div className={`p-3 rounded-lg border ${isRemoteAccess ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className={`h-4 w-4 ${isRemoteAccess ? 'text-red-600' : 'text-green-600'}`} />
                    <span className={`text-sm font-medium ${isRemoteAccess ? 'text-red-800' : 'text-green-800'}`}>
                      Remote Access
                    </span>
                  </div>
                  <p className={`text-xs ${isRemoteAccess ? 'text-red-700' : 'text-green-700'}`}>
                    {isRemoteAccess ? 'Detected remote access tools' : 'No remote access detected'}
                  </p>
                </div>

                {/* Virtual Machine Detection */}
                <div className={`p-3 rounded-lg border ${isVirtualMachine ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Server className={`h-4 w-4 ${isVirtualMachine ? 'text-red-600' : 'text-green-600'}`} />
                    <span className={`text-sm font-medium ${isVirtualMachine ? 'text-red-800' : 'text-green-800'}`}>
                      Virtual Machine
                    </span>
                  </div>
                  <p className={`text-xs ${isVirtualMachine ? 'text-red-700' : 'text-green-700'}`}>
                    {isVirtualMachine ? 'Virtual environment detected' : 'Physical environment detected'}
                  </p>
                </div>
              </div>

              {/* Technical Details */}
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Technical Details
                </summary>
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div><strong>Platform:</strong> {detectionDetails.platform}</div>
                    <div><strong>Resolution:</strong> {detectionDetails.screenResolution}</div>
                    <div><strong>Timezone:</strong> {detectionDetails.timezone}</div>
                    <div><strong>WebGL:</strong> {detectionDetails.webgl.substring(0, 50)}...</div>
                  </div>
                </div>
              </details>

              {hasSecurityConcerns && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">Proceeding with Assessment</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    If you continue, this will be flagged for review. Only proceed if you're using 
                    a legitimate setup and not attempting to circumvent security measures.
                  </p>
                  <ul className="text-xs text-yellow-600 space-y-1">
                    <li>• This session will be marked as "High Risk"</li>
                    <li>• Additional monitoring will be applied</li>
                    <li>• Results may require manual verification</li>
                  </ul>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3 justify-end mt-6">
          <Button 
            variant="outline"
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel Assessment
          </Button>
          <Button 
            onClick={onProceed}
            className={hasSecurityConcerns ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {hasSecurityConcerns ? 'Proceed Anyway' : 'Continue Assessment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};