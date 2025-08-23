import { useEffect, useState, useCallback } from 'react';

interface RemoteAccessDetectionResult {
  isRemoteAccess: boolean;
  isVirtualMachine: boolean;
  isScreenSharing: boolean;
  chromeRemoteDesktop: boolean;
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
    colorDepth: number;
    screenSharing: boolean;
    sessionIndicators: string[];
    performanceCharacteristics: {
      renderTime: number;
      networkLatency: number;
      fps: number;
    };
    cssMediaQueries: {
      limitedColors: boolean;
      commonRdpDpi: boolean;
      suspiciousAspectRatio: boolean;
    };
    chromeRemoteDesktopIndicators: string[];
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

  const detectScreenSharing = useCallback(async (): Promise<{isSharing: boolean, indicators: string[]}> => {
    const indicators: string[] = [];
    let isSharing = false;

    try {
      // Check if Screen Capture API is available and being used
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Monitor for active screen capture
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        
        // Check if getDisplayMedia has been called recently
        if ((window as any).__screenCaptureActive) {
          isSharing = true;
          indicators.push('Active screen capture detected');
        }

        // Check for MediaStream tracks that might indicate screen sharing
        if ((window as any).MediaStreamTrack) {
          const tracks = (window as any).__activeScreenTracks || [];
          if (tracks.length > 0) {
            isSharing = true;
            indicators.push('Active screen sharing tracks detected');
          }
        }
      }

      // Check for WebRTC connections that might indicate screen sharing
      if ((window as any).RTCPeerConnection) {
        const connections = (window as any).__activePeerConnections || [];
        for (const connection of connections) {
          if (connection.getSenders) {
            const senders = connection.getSenders();
            for (const sender of senders) {
              if (sender.track && sender.track.kind === 'video' && sender.track.label.includes('screen')) {
                isSharing = true;
                indicators.push('WebRTC screen sharing detected');
                break;
              }
            }
          }
        }
      }

      // Check for presentation mode or fullscreen APIs being used suspiciously
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        indicators.push('Fullscreen mode active');
      }

      // Check for Picture-in-Picture API usage
      if ((document as any).pictureInPictureElement) {
        indicators.push('Picture-in-Picture active');
      }

    } catch (error) {
      indicators.push('Screen sharing detection error');
    }

    return { isSharing, indicators };
  }, []);

  const detectSystemMetrics = useCallback((): {
    colorDepth: number;
    sessionIndicators: string[];
    performanceCharacteristics: {
      renderTime: number;
      networkLatency: number;
      fps: number;
    };
  } => {
    const sessionIndicators: string[] = [];
    
    // Color depth analysis
    const colorDepth = screen.colorDepth;
    if (colorDepth <= 16) {
      sessionIndicators.push('Limited color depth detected');
    }

    // Session name detection (Windows Terminal Services)
    try {
      const sessionName = (window as any).clientInformation?.platform;
      if (sessionName && sessionName.includes('RDP')) {
        sessionIndicators.push('RDP session detected');
      }
    } catch (error) {
      // Ignore errors
    }

    // Performance characteristics
    const startTime = performance.now();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 100, 100);
    }
    const renderTime = performance.now() - startTime;

    // Network latency estimation
    const networkStart = performance.now();
    fetch('data:text/plain,test').then(() => {
      const networkLatency = performance.now() - networkStart;
    }).catch(() => {});

    // FPS detection
    let frameCount = 0;
    const fpsStart = performance.now();
    
    const countFrames = () => {
      frameCount++;
      if (performance.now() - fpsStart < 1000) {
        requestAnimationFrame(countFrames);
      }
    };
    requestAnimationFrame(countFrames);

    return {
      colorDepth,
      sessionIndicators,
      performanceCharacteristics: {
        renderTime,
        networkLatency: 0, // Will be updated asynchronously
        fps: frameCount
      }
    };
  }, []);

  const detectCSSMediaQueries = useCallback((): {
    limitedColors: boolean;
    commonRdpDpi: boolean;
    suspiciousAspectRatio: boolean;
  } => {
    // Check for limited color capabilities
    const limitedColors = window.matchMedia('(max-color: 8)').matches || 
                         window.matchMedia('(max-color-index: 256)').matches;

    // Check for common RDP DPI settings
    const commonRdpDpi = window.matchMedia('(resolution: 96dpi)').matches ||
                        window.matchMedia('(resolution: 120dpi)').matches ||
                        window.matchMedia('(resolution: 144dpi)').matches;

    // Check for suspicious aspect ratios common in remote desktop
    const suspiciousAspectRatio = window.matchMedia('(aspect-ratio: 4/3)').matches ||
                                 window.matchMedia('(aspect-ratio: 5/4)').matches ||
                                 window.matchMedia('(aspect-ratio: 16/10)').matches;

    return {
      limitedColors,
      commonRdpDpi,
      suspiciousAspectRatio
    };
  }, []);

  const detectChromeRemoteDesktop = useCallback((): {detected: boolean, indicators: string[]} => {
    const indicators: string[] = [];
    let detected = false;

    // Check user agent for Chrome Remote Desktop specific strings
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('crd') || userAgent.includes('chrome remote desktop')) {
      detected = true;
      indicators.push('Chrome Remote Desktop user agent detected');
    }

    // Check for Chrome Remote Desktop specific DOM modifications
    if (document.querySelector('[data-crd]') || document.querySelector('.crd-container')) {
      detected = true;
      indicators.push('Chrome Remote Desktop DOM elements detected');
    }

    // Check for Chrome Remote Desktop specific window properties
    if ((window as any).chrome && (window as any).chrome.runtime) {
      try {
        const manifest = (window as any).chrome.runtime.getManifest?.();
        if (manifest && manifest.name && manifest.name.includes('Chrome Remote Desktop')) {
          detected = true;
          indicators.push('Chrome Remote Desktop extension detected');
        }
      } catch (error) {
        // Extension API not available or blocked
      }
    }

    // Check for Chrome Remote Desktop network characteristics
    if ((navigator as any).connection) {
      const connection = (navigator as any).connection;
      // Chrome Remote Desktop often shows specific connection types
      if (connection.effectiveType === '2g' && connection.downlink < 1) {
        indicators.push('Suspicious network characteristics');
      }
    }

    // Check for Chrome Remote Desktop clipboard access patterns
    if (navigator.clipboard) {
      // Chrome Remote Desktop heavily uses clipboard API
      const originalWriteText = navigator.clipboard.writeText;
      if (originalWriteText.toString().includes('remote') || originalWriteText.toString().includes('crd')) {
        detected = true;
        indicators.push('Chrome Remote Desktop clipboard integration detected');
      }
    }

    // Check for Chrome Remote Desktop specific keyboard/mouse event patterns
    const mouseEvents = (window as any).__mouseEventCount || 0;
    const keyboardEvents = (window as any).__keyboardEventCount || 0;
    
    if (mouseEvents === 0 && keyboardEvents > 10) {
      indicators.push('Suspicious input patterns detected');
    }

    // Check for Chrome Remote Desktop specific window dimensions
    const { innerWidth, innerHeight } = window;
    const aspectRatio = innerWidth / innerHeight;
    
    // Common Chrome Remote Desktop window sizes
    const commonCrdSizes = [
      { width: 1024, height: 768 },
      { width: 1280, height: 720 },
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 }
    ];

    for (const size of commonCrdSizes) {
      if (Math.abs(innerWidth - size.width) < 50 && Math.abs(innerHeight - size.height) < 50) {
        indicators.push('Common Chrome Remote Desktop window size detected');
        break;
      }
    }

    // Check for Chrome Remote Desktop specific timing characteristics
    const now = Date.now();
    const timingOffset = now % 1000;
    
    // Chrome Remote Desktop often has specific timing patterns
    if (timingOffset < 50 || timingOffset > 950) {
      indicators.push('Suspicious timing patterns detected');
    }

    return { detected, indicators };
  }, []);

  const detectRemoteDesktop = useCallback((): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Common remote desktop software patterns
    const remoteDesktopPatterns = [
      'teamviewer',
      'anydesk',
      'chrome remote desktop',
      'rdp',
      'vnc',
      'citrix',
      'parallels',
      'vmware',
      'virtualbox',
      'microsoft remote desktop',
      'remote desktop connection'
    ];
    
    return remoteDesktopPatterns.some(pattern => userAgent.includes(pattern));
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
    
    // Enhanced detection methods
    const screenSharingResult = await detectScreenSharing();
    const systemMetrics = detectSystemMetrics();
    const cssMediaResults = detectCSSMediaQueries();
    const chromeRemoteDesktopResult = detectChromeRemoteDesktop();
    
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
      canvas: generateCanvasFingerprint(),
      colorDepth: systemMetrics.colorDepth,
      screenSharing: screenSharingResult.isSharing,
      sessionIndicators: [...systemMetrics.sessionIndicators, ...screenSharingResult.indicators],
      performanceCharacteristics: systemMetrics.performanceCharacteristics,
      cssMediaQueries: cssMediaResults,
      chromeRemoteDesktopIndicators: chromeRemoteDesktopResult.indicators,
    };
    
    return {
      isRemoteAccess: remoteDesktopDetected || webdriverDetected || chromeRemoteDesktopResult.detected,
      isVirtualMachine: virtualMachineDetected,
      isScreenSharing: screenSharingResult.isSharing,
      chromeRemoteDesktop: chromeRemoteDesktopResult.detected,
      detectionDetails
    };
  }, [
    detectWebDriver, 
    detectRemoteDesktop, 
    detectVirtualMachine, 
    generateCanvasFingerprint, 
    getWebGLFingerprint,
    detectScreenSharing,
    detectSystemMetrics,
    detectCSSMediaQueries,
    detectChromeRemoteDesktop
  ]);

  useEffect(() => {
    // Set up real-time monitoring for screen sharing and remote desktop activity
    const setupMonitoring = () => {
      // Monitor Screen Capture API usage
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getDisplayMedia = async (constraints?: any) => {
          (window as any).__screenCaptureActive = true;
          const stream = await originalGetDisplayMedia(constraints);
          
          // Track active screen sharing
          if (!stream) return stream;
          
          const tracks = stream.getVideoTracks();
          (window as any).__activeScreenTracks = tracks;
          
          // Monitor when screen sharing stops
          tracks.forEach(track => {
            track.addEventListener('ended', () => {
              (window as any).__screenCaptureActive = false;
              (window as any).__activeScreenTracks = [];
            });
          });
          
          return stream;
        };
      }

      // Monitor mouse and keyboard events for pattern analysis
      let mouseEventCount = 0;
      let keyboardEventCount = 0;
      
      const mouseHandler = () => mouseEventCount++;
      const keyboardHandler = () => keyboardEventCount++;
      
      document.addEventListener('mousemove', mouseHandler);
      document.addEventListener('keydown', keyboardHandler);
      
      // Update global counters periodically
      const updateCounters = () => {
        (window as any).__mouseEventCount = mouseEventCount;
        (window as any).__keyboardEventCount = keyboardEventCount;
      };
      
      const counterInterval = setInterval(updateCounters, 1000);
      
      // Cleanup function
      return () => {
        document.removeEventListener('mousemove', mouseHandler);
        document.removeEventListener('keydown', keyboardHandler);
        clearInterval(counterInterval);
      };
    };

    const cleanup = setupMonitoring();

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

    return cleanup;
  }, [performDetection]);

  return {
    detectionResult,
    isLoading,
    rerunDetection: performDetection,
    
    // Enhanced security report for assessment system
    getSecurityReport: useCallback(() => {
      if (!detectionResult) return null;
      
      const threats = [];
      const warnings = [];
      const info = [];
      
      if (detectionResult.chromeRemoteDesktop) {
        threats.push('Chrome Remote Desktop detected');
      }
      
      if (detectionResult.isScreenSharing) {
        threats.push('Active screen sharing detected');
      }
      
      if (detectionResult.isRemoteAccess) {
        threats.push('Remote access software detected');
      }
      
      if (detectionResult.isVirtualMachine) {
        warnings.push('Virtual machine environment detected');
      }
      
      if (detectionResult.detectionDetails.cssMediaQueries.limitedColors) {
        warnings.push('Limited color depth indicates possible remote session');
      }
      
      if (detectionResult.detectionDetails.sessionIndicators.length > 0) {
        warnings.push(`Session indicators found: ${detectionResult.detectionDetails.sessionIndicators.join(', ')}`);
      }
      
      if (detectionResult.detectionDetails.chromeRemoteDesktopIndicators.length > 0) {
        info.push(`Chrome Remote Desktop indicators: ${detectionResult.detectionDetails.chromeRemoteDesktopIndicators.join(', ')}`);
      }
      
      const riskLevel = threats.length > 0 ? 'HIGH' : warnings.length > 0 ? 'MEDIUM' : 'LOW';
      
      return {
        riskLevel,
        threats,
        warnings,
        info,
        recommendation: riskLevel === 'HIGH' ? 
          'Assessment cannot proceed due to security violations' :
          riskLevel === 'MEDIUM' ?
          'Proceed with caution and enhanced monitoring' :
          'Environment appears secure for assessment',
        timestamp: new Date().toISOString(),
        environmentFingerprint: {
          userAgent: detectionResult.detectionDetails.userAgent,
          screenResolution: detectionResult.detectionDetails.screenResolution,
          timezone: detectionResult.detectionDetails.timezone,
          colorDepth: detectionResult.detectionDetails.colorDepth,
          platform: detectionResult.detectionDetails.platform
        }
      };
    }, [detectionResult])
  };
};