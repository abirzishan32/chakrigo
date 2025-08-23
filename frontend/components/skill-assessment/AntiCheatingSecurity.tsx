"use client";

import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface AntiCheatingSecurityProps {
  isActive: boolean;
  onViolationDetected: (reason: string) => void;
  assessmentId?: string;
}

const AntiCheatingSecurity: React.FC<AntiCheatingSecurityProps> = ({
  isActive,
  onViolationDetected,
  assessmentId
}) => {
  const originalFunctionsRef = useRef<{
    execCommand?: typeof document.execCommand;
    createObjectURL?: typeof URL.createObjectURL;
  }>({});

  useEffect(() => {
    if (!isActive) return;

    // Store original functions for cleanup
    originalFunctionsRef.current = {
      execCommand: document.execCommand,
      createObjectURL: URL.createObjectURL
    };

    // Comprehensive page saving prevention
    const preventPageSaving = () => {
      // 1. Block keyboard shortcuts for saving
      const handleKeyDown = (e: KeyboardEvent) => {
        const isCtrlOrCmd = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;
        const key = e.key.toLowerCase();

        // Prevent Ctrl+S / Cmd+S (Save)
        if (isCtrlOrCmd && key === 's' && !isShift) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          onViolationDetected("Page saving attempt detected (Ctrl/Cmd+S)");
          toast.error("Page saving is not allowed during the assessment", { duration: 3000 });
          return false;
        }

        // Prevent Ctrl+Shift+S / Cmd+Shift+S (Save As)
        if (isCtrlOrCmd && isShift && key === 's') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          onViolationDetected("Page saving attempt detected (Save As)");
          toast.error("Page saving is not allowed during the assessment", { duration: 3000 });
          return false;
        }

        // Prevent other dangerous shortcuts
        if (isCtrlOrCmd && key === 'u') { // View Source
          e.preventDefault();
          onViolationDetected("View source attempt detected");
          return false;
        }

        if (e.key === 'F12') { // Developer Tools
          e.preventDefault();
          onViolationDetected("Developer tools access attempt");
          return false;
        }

        if ((e.ctrlKey && e.shiftKey && key === 'i') || 
            (e.metaKey && e.altKey && key === 'i')) { // Dev Tools
          e.preventDefault();
          onViolationDetected("Developer tools access attempt");
          return false;
        }

        // Prevent PrintScreen
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          onViolationDetected("Screenshot attempt detected");
          return false;
        }

        // Mac screenshot shortcuts
        if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(key)) {
          e.preventDefault();
          onViolationDetected("Screenshot attempt detected (Mac)");
          return false;
        }

        // Windows Snipping Tool (Win+Shift+S)
        if (e.key === 's' && e.shiftKey && e.metaKey) {
          e.preventDefault();
          onViolationDetected("Screenshot attempt detected (Windows Snipping Tool)");
          return false;
        }
      };

      // 2. Block right-click context menu
      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onViolationDetected("Right-click context menu access attempt");
        toast.error("Right-click is disabled during the assessment", { duration: 3000 });
        return false;
      };

      // 3. Override document.execCommand to prevent save commands
      document.execCommand = function(command: string, showUI?: boolean, value?: string) {
        const cmd = command.toLowerCase();
        if (cmd === 'saveas' || cmd === 'save') {
          onViolationDetected("Page saving attempt through execCommand");
          toast.error("Page saving is blocked", { duration: 3000 });
          return false;
        }
        return originalFunctionsRef.current.execCommand?.call(this, command, showUI, value) || false;
      };

      // 4. Override URL.createObjectURL to prevent MHTML/blob saving
      URL.createObjectURL = function(object: Blob | MediaSource) {
        if (object instanceof Blob) {
          const type = object.type.toLowerCase();
          // Block HTML, MHTML, and text content that could be saved pages
          if (type.includes('text/html') || 
              type.includes('application/x-mhtml') ||
              type.includes('message/rfc822') ||
              type.includes('multipart/related') ||
              (type.includes('text/plain') && object.size > 10000)) { // Large text files
            onViolationDetected("Blob creation attempt for page content");
            throw new Error('Blob creation blocked by assessment security policy');
          }
        }
        return originalFunctionsRef.current.createObjectURL?.call(this, object) || '';
      };

      // 5. Block download links
      const preventDownloads = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'A') {
          const link = target as HTMLAnchorElement;
          // Block any download attribute
          if (link.hasAttribute('download')) {
            e.preventDefault();
            e.stopPropagation();
            onViolationDetected("Download link activation attempt");
            return false;
          }
          
          // Block data URLs that could contain page content
          if (link.href.startsWith('data:text/html') || 
              link.href.startsWith('data:application/x-mhtml') ||
              link.href.startsWith('blob:')) {
            e.preventDefault();
            e.stopPropagation();
            onViolationDetected("Suspicious download link detected");
            return false;
          }
        }
      };

      // 6. Prevent copying content
      const preventCopy = (e: ClipboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toast.error("Copying is not allowed during the assessment", { duration: 3000 });
      };

      // 7. Prevent drag and drop
      const preventDrag = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };

      // 8. Prevent text selection
      const preventSelection = (e: Event) => {
        e.preventDefault();
        return false;
      };

      // 9. Monitor for suspicious window events
      const handleWindowBlur = () => {
        console.warn('Window lost focus - potential browser menu access');
      };

      // 10. Block F-keys that might open save dialogs
      const blockFKeys = (e: KeyboardEvent) => {
        if (e.key.startsWith('F') && e.key.length <= 3) {
          const fKeyNum = parseInt(e.key.substring(1));
          if ([1, 3, 5, 6, 7, 11, 12].includes(fKeyNum)) { // Common dangerous F-keys
            e.preventDefault();
            if (fKeyNum === 12) {
              onViolationDetected("Developer tools access attempt (F12)");
            }
          }
        }
      };

      // Add all event listeners
      document.addEventListener('keydown', handleKeyDown, true);
      document.addEventListener('keydown', blockFKeys, true);
      document.addEventListener('contextmenu', preventContextMenu, true);
      document.addEventListener('click', preventDownloads, true);
      document.addEventListener('copy', preventCopy, true);
      document.addEventListener('cut', preventCopy, true);
      document.addEventListener('paste', preventCopy, true);
      document.addEventListener('dragstart', preventDrag, true);
      document.addEventListener('drop', preventDrag, true);
      document.addEventListener('selectstart', preventSelection, true);
      window.addEventListener('blur', handleWindowBlur);

      // Disable text selection via CSS
      const style = document.createElement('style');
      style.textContent = `
        .anti-cheat-no-select * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .anti-cheat-no-context {
          pointer-events: auto !important;
        }
        .anti-cheat-no-context * {
          -webkit-context-menu: none !important;
          context-menu: none !important;
        }
      `;
      document.head.appendChild(style);
      document.body.classList.add('anti-cheat-no-select', 'anti-cheat-no-context');

      // Return cleanup function
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('keydown', blockFKeys, true);
        document.removeEventListener('contextmenu', preventContextMenu, true);
        document.removeEventListener('click', preventDownloads, true);
        document.removeEventListener('copy', preventCopy, true);
        document.removeEventListener('cut', preventCopy, true);
        document.removeEventListener('paste', preventCopy, true);
        document.removeEventListener('dragstart', preventDrag, true);
        document.removeEventListener('drop', preventDrag, true);
        document.removeEventListener('selectstart', preventSelection, true);
        window.removeEventListener('blur', handleWindowBlur);
        
        // Restore original functions
        if (originalFunctionsRef.current.execCommand) {
          document.execCommand = originalFunctionsRef.current.execCommand;
        }
        if (originalFunctionsRef.current.createObjectURL) {
          URL.createObjectURL = originalFunctionsRef.current.createObjectURL;
        }
        
        // Remove CSS classes and styles
        document.body.classList.remove('anti-cheat-no-select', 'anti-cheat-no-context');
        style.remove();
      };
    };

    // Apply all protections
    const cleanup = preventPageSaving();

    // Cleanup on component unmount or when isActive becomes false
    return cleanup;
  }, [isActive, onViolationDetected]);

  // This component doesn't render anything visible
  return null;
};

export default AntiCheatingSecurity;
