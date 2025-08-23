import { useEffect, useState, useCallback } from 'react';

interface RemoteAccessDetectionResult {
  isRemoteAccess: boolean;
  isVirtualMachine: boolean;
  detectionDetails: {
    userAgent: string;
    platform: string;
    webdriver: boolean;
    automation: boolean;
    remoteDesktop: boolean;
    virtualEnvironment: boolean;
    screenResolution: string;
    timezone: string;
    plugins: string[];
    webgl: string;
    canvas: string;
  };
}

export const useRemoteAccessDetection = () => {
  const [detectionResult, setDetectionResult] = useState<RemoteAccessDetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const detectWebDriver = useCallback((): boolean => {
    // Check for webdriver presence
    if (navigator.webdriver) return true;
    
    // Check for automation indicators
    if ((window as any).webdriver) return true;
    if ((window as any).domAutomation) return true;
    if ((window as any).domAutomationController) return true;
    if ((window as any)._phantom) return true;
    if ((window as any).callPhantom) return true;
    
    // Check for Selenium indicators
    if ((window as any).selenium) return true;
    if ((document as any).__webdriver_evaluate) return true;
    if ((document as any).__selenium_evaluate) return true;
    if ((document as any).__webdriver_script_function) return true;
    if ((document as any).__webdriver_script_func) return true;
    if ((document as any).__selenium_unwrapped) return true;
    if ((document as any).__fxdriver_evaluate) return true;
    if ((document as any).__driver_unwrapped) return true;
    if ((document as any).__webdriver_unwrapped) return true;
    if ((document as any).__driver_evaluate) return true;
    if ((document as any).__selenium_evaluate) return true;
    if ((document as any).__fxdriver_unwrapped) return true;

    return false;
  }, []);

  const detectRemoteDesktop = useCallback((): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Check for RDP indicators
    if (userAgent.includes('rdp')) return true;
    if (userAgent.includes('remote desktop')) return true;
    if (userAgent.includes('teamviewer')) return true;
    if (userAgent.includes('anydesk')) return true;
    if (userAgent.includes('vnc')) return true;
    if (userAgent.includes('chrome remote desktop')) return true;
    
    // Check for screen sharing indicators
    if (userAgent.includes('screenshare')) return true;
    if (userAgent.includes('screen share')) return true;
    
    return false;
  }, []);

  const detectVirtualMachine = useCallback((): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    // Check user agent for VM indicators
    if (userAgent.includes('virtualbox')) return true;
    if (userAgent.includes('vmware')) return true;
    if (userAgent.includes('qemu')) return true;
    if (userAgent.includes('kvm')) return true;
    if (userAgent.includes('xen')) return true;
    if (userAgent.includes('hyper-v')) return true;
    if (userAgent.includes('parallels')) return true;
    
    // Check platform for VM indicators
    if (platform.includes('vm')) return true;
    if (platform.includes('virtual')) return true;
    
    // Check for VM-specific hardware signatures
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);
        
        if (renderer.toLowerCase().includes('virtualbox')) return true;
        if (renderer.toLowerCase().includes('vmware')) return true;
        if (vendor.toLowerCase().includes('virtualbox')) return true;
        if (vendor.toLowerCase().includes('vmware')) return true;
      }
    } catch (error) {
      // WebGL not supported or blocked
    }
    
    // Check for VM-specific screen resolutions
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const commonVMResolutions = [
      [800, 600], [1024, 768], [1280, 800], [1440, 900], [1920, 1200]
    ];
    
    const isCommonVMResolution = commonVMResolutions.some(
      ([width, height]) => screenWidth === width && screenHeight === height
    );
    
    // Check for limited hardware concurrency (common in VMs)
    const cores = navigator.hardwareConcurrency;
    if (cores && cores <= 2) {
      // This is a weak indicator, but combined with others...
    }
    
    return isCommonVMResolution && cores <= 2;
  }, []);

  const generateCanvasFingerprint = useCallback((): string => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      
      canvas.width = 200;
      canvas.height = 50;
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Anti-cheat test 🔒', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Anti-cheat test 🔒', 4, 17);
      
      return canvas.toDataURL();
    } catch (error) {
      return 'error';
    }
  }, []);

  const getWebGLFingerprint = useCallback((): string => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return '';
      
      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      const version = gl.getParameter(gl.VERSION);
      
      return `${vendor} ${renderer} ${version}`;
    } catch (error) {
      return 'error';
    }
  }, []);

  const performDetection = useCallback(async (): Promise<RemoteAccessDetectionResult> => {
    const webdriverDetected = detectWebDriver();
    const remoteDesktopDetected = detectRemoteDesktop();
    const virtualMachineDetected = detectVirtualMachine();
    
    const detectionDetails = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      webdriver: webdriverDetected,
      automation: webdriverDetected,
      remoteDesktop: remoteDesktopDetected,
      virtualEnvironment: virtualMachineDetected,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      plugins: Array.from(navigator.plugins).map(plugin => plugin.name),
      webgl: getWebGLFingerprint(),
      canvas: generateCanvasFingerprint()
    };
    
    return {
      isRemoteAccess: remoteDesktopDetected || webdriverDetected,
      isVirtualMachine: virtualMachineDetected,
      detectionDetails
    };
  }, [detectWebDriver, detectRemoteDesktop, detectVirtualMachine, generateCanvasFingerprint, getWebGLFingerprint]);

  useEffect(() => {
    const runDetection = async () => {
      setIsLoading(true);
      try {
        const result = await performDetection();
        setDetectionResult(result);
      } catch (error) {
        console.error('Detection failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    runDetection();
  }, [performDetection]);

  return {
    detectionResult,
    isLoading,
    rerunDetection: performDetection
  };
};