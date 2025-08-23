

(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    showWarnings: true,
    logViolations: true,
    preventDevTools: true,
    onViolation: function(reason) {
      if (CONFIG.logViolations) {
        console.warn('Assessment Security Violation:', reason);
      }
      if (CONFIG.showWarnings) {
        alert('Security Violation: ' + reason + '\nThis action is not allowed during the assessment.');
      }
      // You can customize this to call your violation handler
      // Example: window.handleSecurityViolation?.(reason);
    }
  };

  // Store original functions for cleanup
  const originalFunctions = {
    execCommand: document.execCommand,
    createObjectURL: URL.createObjectURL,
    createElement: document.createElement
  };

  // 1. Keyboard shortcut prevention
  function handleKeyDown(e) {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = e.key.toLowerCase();

    // Prevent save shortcuts
    if (isCtrlOrCmd && key === 's') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (isShift) {
        CONFIG.onViolation('Save As attempt detected (Ctrl/Cmd+Shift+S)');
      } else {
        CONFIG.onViolation('Page save attempt detected (Ctrl/Cmd+S)');
      }
      return false;
    }

    // Prevent other dangerous shortcuts
    if (CONFIG.preventDevTools) {
      // F12 - Developer Tools
      if (e.key === 'F12') {
        e.preventDefault();
        CONFIG.onViolation('Developer tools access attempt (F12)');
        return false;
      }

      // Ctrl+Shift+I / Cmd+Alt+I - Developer Tools
      if ((e.ctrlKey && e.shiftKey && key === 'i') || 
          (e.metaKey && e.altKey && key === 'i')) {
        e.preventDefault();
        CONFIG.onViolation('Developer tools access attempt');
        return false;
      }

      // Ctrl+U / Cmd+U - View Source
      if (isCtrlOrCmd && key === 'u') {
        e.preventDefault();
        CONFIG.onViolation('View source attempt detected');
        return false;
      }

      // Ctrl+Shift+J / Cmd+Alt+J - Console
      if ((e.ctrlKey && e.shiftKey && key === 'j') || 
          (e.metaKey && e.altKey && key === 'j')) {
        e.preventDefault();
        CONFIG.onViolation('Console access attempt');
        return false;
      }
    }

    // Prevent screenshot shortcuts
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      CONFIG.onViolation('Screenshot attempt detected (PrintScreen)');
      return false;
    }

    // Mac screenshot shortcuts (Cmd+Shift+3/4/5)
    if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(key)) {
      e.preventDefault();
      CONFIG.onViolation('Screenshot attempt detected (Mac shortcut)');
      return false;
    }

    // Windows Snipping Tool (Win+Shift+S)
    if (e.key === 's' && e.shiftKey && e.metaKey) {
      e.preventDefault();
      CONFIG.onViolation('Screenshot attempt detected (Windows Snipping Tool)');
      return false;
    }
  }

  // 2. Context menu prevention
  function preventContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    CONFIG.onViolation('Right-click context menu access attempt');
    return false;
  }

  // 3. Override document.execCommand
  document.execCommand = function(command, showUI, value) {
    const cmd = command.toLowerCase();
    if (cmd === 'saveas' || cmd === 'save') {
      CONFIG.onViolation('Page save attempt through execCommand');
      return false;
    }
    return originalFunctions.execCommand.call(this, command, showUI, value);
  };

  // 4. Override URL.createObjectURL to prevent MHTML/blob saving
  URL.createObjectURL = function(object) {
    if (object instanceof Blob) {
      const type = object.type.toLowerCase();
      const suspiciousTypes = [
        'text/html',
        'application/x-mhtml',
        'message/rfc822',
        'multipart/related',
        'application/octet-stream'
      ];
      
      if (suspiciousTypes.some(t => type.includes(t)) || 
          (type.includes('text/plain') && object.size > 50000)) {
        CONFIG.onViolation('Blob creation attempt for page content');
        throw new Error('Blob creation blocked by assessment security policy');
      }
    }
    return originalFunctions.createObjectURL.call(this, object);
  };

  // 5. Prevent download links and data URLs
  function preventDownloads(e) {
    const target = e.target;
    if (target && target.tagName === 'A') {
      // Block download attribute
      if (target.hasAttribute('download')) {
        e.preventDefault();
        e.stopPropagation();
        CONFIG.onViolation('Download link activation attempt');
        return false;
      }
      
      // Block suspicious data URLs
      const href = target.href || '';
      if (href.startsWith('data:text/html') || 
          href.startsWith('data:application/x-mhtml') ||
          href.startsWith('blob:')) {
        e.preventDefault();
        e.stopPropagation();
        CONFIG.onViolation('Suspicious download link detected');
        return false;
      }
    }
  }

  // 6. Prevent copy/paste operations
  function preventClipboard(e) {
    e.preventDefault();
    e.stopPropagation();
    if (CONFIG.showWarnings) {
      alert('Copying/pasting is not allowed during the assessment');
    }
  }

  // 7. Prevent drag operations
  function preventDrag(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // 8. Prevent text selection
  function preventSelection(e) {
    e.preventDefault();
    return false;
  }

  // 9. Monitor for file system access APIs
  function blockFileSystemAPIs() {
    // Block File System Access API if available
    if ('showSaveFilePicker' in window) {
      window.showSaveFilePicker = function() {
        CONFIG.onViolation('File System Access API save attempt');
        return Promise.reject(new Error('File saving blocked by assessment security policy'));
      };
    }

    // Block other file APIs
    if ('showOpenFilePicker' in window) {
      const originalShowOpenFilePicker = window.showOpenFilePicker;
      window.showOpenFilePicker = function() {
        CONFIG.onViolation('File System Access API open attempt');
        return originalShowOpenFilePicker.apply(this, arguments);
      };
    }
  }

  // 10. Add CSS to prevent selection and context menus
  function addProtectionCSS() {
    const style = document.createElement('style');
    style.id = 'assessment-protection-css';
    style.textContent = `
      body, body * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      /* Allow selection only for input fields */
      input[type="text"], input[type="password"], input[type="email"], 
      input[type="number"], textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      /* Hide context menu */
      * {
        -webkit-context-menu: none !important;
        context-menu: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  // 11. Initialize all protections
  function initializeProtections() {
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', preventContextMenu, true);
    document.addEventListener('click', preventDownloads, true);
    document.addEventListener('copy', preventClipboard, true);
    document.addEventListener('cut', preventClipboard, true);
    document.addEventListener('paste', preventClipboard, true);
    document.addEventListener('dragstart', preventDrag, true);
    document.addEventListener('drop', preventDrag, true);
    document.addEventListener('selectstart', preventSelection, true);

    // Block file system APIs
    blockFileSystemAPIs();

    // Add protection CSS
    addProtectionCSS();

    console.log('Assessment page save prevention activated');
  }

  // 12. Cleanup function (for testing or deactivation)
  function cleanup() {
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('contextmenu', preventContextMenu, true);
    document.removeEventListener('click', preventDownloads, true);
    document.removeEventListener('copy', preventClipboard, true);
    document.removeEventListener('cut', preventClipboard, true);
    document.removeEventListener('paste', preventClipboard, true);
    document.removeEventListener('dragstart', preventDrag, true);
    document.removeEventListener('drop', preventDrag, true);
    document.removeEventListener('selectstart', preventSelection, true);

    // Restore original functions
    document.execCommand = originalFunctions.execCommand;
    URL.createObjectURL = originalFunctions.createObjectURL;

    // Remove protection CSS
    const protectionCSS = document.getElementById('assessment-protection-css');
    if (protectionCSS) {
      protectionCSS.remove();
    }

    console.log('Assessment page save prevention deactivated');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProtections);
  } else {
    initializeProtections();
  }

  // Expose cleanup function globally for testing
  window.disableAssessmentProtection = cleanup;

  // Expose configuration for customization
  window.assessmentSecurityConfig = CONFIG;

})();
