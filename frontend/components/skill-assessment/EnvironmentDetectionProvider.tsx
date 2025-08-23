import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRemoteAccessDetection } from '@/hooks/useRemoteAccessDetection';
import { EnvironmentDetectionModal } from './EnvironmentDetectionModal';
import { useRouter } from 'next/navigation';

interface EnvironmentDetectionContextType {
  isEnvironmentVerified: boolean;
  isHighRisk: boolean;
  detectionResult: any;
  triggerRecheck: () => void;
}

const EnvironmentDetectionContext = createContext<EnvironmentDetectionContextType | undefined>(undefined);

interface EnvironmentDetectionProviderProps {
  children: React.ReactNode;
  assessmentId?: string;
  onEnvironmentRisk?: (riskLevel: 'low' | 'high', details: any) => void;
}

export const EnvironmentDetectionProvider: React.FC<EnvironmentDetectionProviderProps> = ({
  children,
  assessmentId,
  onEnvironmentRisk
}) => {
  const [isEnvironmentVerified, setIsEnvironmentVerified] = useState(false);
  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [isHighRisk, setIsHighRisk] = useState(false);
  const router = useRouter();
  
  const { detectionResult, isLoading, rerunDetection } = useRemoteAccessDetection();

  useEffect(() => {
    if (detectionResult && !isLoading) {
      const hasSecurityConcerns = detectionResult.isRemoteAccess || detectionResult.isVirtualMachine;
      
      if (hasSecurityConcerns) {
        setIsHighRisk(true);
        setShowDetectionModal(true);
        
        // Log the security concern
        console.warn('Environment security concern detected:', {
          assessmentId,
          remoteAccess: detectionResult.isRemoteAccess,
          virtualMachine: detectionResult.isVirtualMachine,
          details: detectionResult.detectionDetails
        });
        
        onEnvironmentRisk?.('high', detectionResult);
      } else {
        setIsEnvironmentVerified(true);
        onEnvironmentRisk?.('low', detectionResult);
      }
    }
  }, [detectionResult, isLoading, assessmentId, onEnvironmentRisk]);

  const handleProceedWithRisk = useCallback(() => {
    setShowDetectionModal(false);
    setIsEnvironmentVerified(true);
    
    // Log that user proceeded despite risks
    console.warn('User proceeded with high-risk environment:', {
      assessmentId,
      detectionResult
    });
  }, [assessmentId, detectionResult]);

  const handleCancelAssessment = useCallback(() => {
    setShowDetectionModal(false);
    router.push('/skill-assessment?error=environment-security');
  }, [router]);

  const triggerRecheck = useCallback(async () => {
    setIsEnvironmentVerified(false);
    setIsHighRisk(false);
    await rerunDetection();
  }, [rerunDetection]);

  // Continuous monitoring during assessment
  useEffect(() => {
    if (!isEnvironmentVerified) return;

    const monitoringInterval = setInterval(async () => {
      const newResult = await rerunDetection();
      
      // Check if environment changed during assessment
      if (newResult.isRemoteAccess || newResult.isVirtualMachine) {
        if (!isHighRisk) {
          setIsHighRisk(true);
          console.warn('Environment changed during assessment:', {
            assessmentId,
            newResult
          });
          onEnvironmentRisk?.('high', newResult);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(monitoringInterval);
  }, [isEnvironmentVerified, isHighRisk, assessmentId, onEnvironmentRisk, rerunDetection]);

  const contextValue: EnvironmentDetectionContextType = {
    isEnvironmentVerified,
    isHighRisk,
    detectionResult,
    triggerRecheck
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Environment Security
          </h2>
          <p className="text-gray-600">
            Checking for virtual machines and remote access tools...
          </p>
        </div>
      </div>
    );
  }

  return (
    <EnvironmentDetectionContext.Provider value={contextValue}>
      {isEnvironmentVerified ? children : null}
      {detectionResult && (
        <EnvironmentDetectionModal
          isOpen={showDetectionModal}
          onProceed={handleProceedWithRisk}
          onCancel={handleCancelAssessment}
          detectionResult={detectionResult}
        />
      )}
    </EnvironmentDetectionContext.Provider>
  );
};

export const useEnvironmentDetection = () => {
  const context = useContext(EnvironmentDetectionContext);
  if (context === undefined) {
    throw new Error('useEnvironmentDetection must be used within an EnvironmentDetectionProvider');
  }
  return context;
};
