// Cognitive Care Portal - Google Apps Script Compatible Styles
// No ES6 export/import - compatible with Google Apps Script

// Color palette
const Colors = {
  darkBlue: '#062146',
  teal: '#80EEDF',
  darkTeal: '#094F48',
  lightGray: '#F1F3F5',
  white: '#ffffff',
  borderGray: '#E2E8F0',
  darkBorderGray: '#CBD5E1',
  darkGrayText: '#333',
  mediumGrayText: '#666',
};

// Portal Styles Object
const PortalStyles = {
  // Navigation styles
  navItem: {
    padding: '12px 16px',
    marginBottom: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#333',
    transition: 'all 0.2s ease',
  },

  navItemActive: {
    backgroundColor: '#062146',
    color: '#ffffff',
  },

  navItemActiveIcon: {
    stroke: '#ffffff',
  },

  // Input box styles
  inputBox: {
    backgroundColor: '#F1F3F5',
    border: '1.5px solid transparent',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    width: '100%',
  },

  inputBoxFocus: {
    backgroundColor: '#ffffff',
    borderColor: '#80EEDF',
    boxShadow: '0 0 0 4px rgba(128, 238, 223, 0.25)',
    outline: 'none',
  },

  // Card styles
  loginCard: {
    boxShadow: '0 25px 50px -12px rgba(6, 33, 70, 0.09), 0 4px 20px -2px rgba(0, 0, 0, 0.04)',
    borderRadius: '12px',
    padding: '32px',
    backgroundColor: '#ffffff',
  },

  // Audio speakable styles
  audioSpeakable: {
    transition: 'color 0.15s ease',
    userSelect: 'none',
    cursor: 'pointer',
    color: '#094F48',
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: '4px',
    display: 'inline-block',
  },

  audioSpeakableHover: {
    color: '#062146',
    backgroundColor: 'rgba(128, 238, 223, 0.1)',
  },

  audioSpeaking: {
    animation: 'speak-pulse 1.2s infinite ease-in-out',
    color: '#094F48',
  },

  // Scrollbar styles
  scrollbar: {
    width: '6px',
    height: '6px',
  },

  scrollbarThumb: {
    background: '#E2E8F0',
    borderRadius: '9999px',
  },

  scrollbarThumbHover: {
    background: '#CBD5E1',
  },
};

// Animations CSS String
const Animations = `
  @keyframes speak-pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.02);
      opacity: 0.8;
    }
  }
`;

// CSS String for all portal styles
const PortalStylesCSS = `
  /* Active Sidebar Navigation Item */
  .nav-item.active {
    background-color: #062146 !important;
    color: #ffffff !important;
  }

  .nav-item.active i {
    stroke: #ffffff !important;
  }

  /* Input Box Focus and Styling */
  .input-box {
    background-color: #F1F3F5;
    border: 1.5px solid transparent;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .input-box:focus-within {
    background-color: #ffffff;
    border-color: #80EEDF;
    box-shadow: 0 0 0 4px rgba(128, 238, 223, 0.25);
  }

  /* Card Elevation Shadow */
  .login-card {
    box-shadow: 0 25px 50px -12px rgba(6, 33, 70, 0.09), 0 4px 20px -2px rgba(0, 0, 0, 0.04);
  }

  /* Audio guidance speakable hover indicators */
  .audio-speakable {
    transition: color 0.15s ease;
    user-select: none;
  }

  .audio-speakable:hover {
    color: #094F48;
  }

  .audio-speaking {
    animation: speak-pulse 1.2s infinite ease-in-out;
    color: #094F48 !important;
  }

  @keyframes speak-pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.02);
      opacity: 0.8;
    }
  }

  /* Custom Scrollbar for responsiveness */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #CBD5E1;
  }
`;

// Utility function to get style as object
function getStyleObject(styleName) {
  if (PortalStyles[styleName]) {
    return PortalStyles[styleName];
  }
  return null;
}

// Utility function to get color
function getColor(colorName) {
  if (Colors[colorName]) {
    return Colors[colorName];
  }
  return null;
}

// Function to inject CSS into HTML
function injectPortalStyles(html) {
  const styleTag = '<style>' + PortalStylesCSS + '</style>';
  return styleTag + html;
}

// Function to get combined style string for inline styles
function getInlineStyle(styleObject) {
  return Object.entries(styleObject)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return cssProperty + ': ' + value;
    })
    .join('; ');
}

// Example usage functions for Google Apps Script

/**
 * Apply portal styles to an HTML document
 * @param {string} html - HTML content
 * @return {string} HTML with portal styles injected
 */
function applyPortalStyles(html) {
  return injectPortalStyles(html);
}

/**
 * Get active navigation item styles
 * @return {Object} Style object
 */
function getActiveNavStyles() {
  return {
    ...PortalStyles.navItem,
    ...PortalStyles.navItemActive
  };
}

/**
 * Get focused input box styles
 * @return {Object} Style object
 */
function getFocusedInputStyles() {
  return {
    ...PortalStyles.inputBox,
    ...PortalStyles.inputBoxFocus
  };
}

/**
 * Get card with shadow styles
 * @return {Object} Style object
 */
function getCardStyles() {
  return PortalStyles.loginCard;
}

/**
 * Get audio speakable hover styles
 * @return {Object} Style object
 */
function getAudioHoverStyles() {
  return {
    ...PortalStyles.audioSpeakable,
    ...PortalStyles.audioSpeakableHover
  };
}

/**
 * Get audio speaking animation styles
 * @return {Object} Style object
 */
function getAudioSpeakingStyles() {
  return {
    ...PortalStyles.audioSpeakable,
    ...PortalStyles.audioSpeaking
  };
}

// Logger function for debugging in Google Apps Script
function logPortalStyles() {
  Logger.log('=== Portal Styles ===');
  Logger.log('Colors: ' + JSON.stringify(Colors, null, 2));
  Logger.log('Portal Styles: ' + JSON.stringify(PortalStyles, null, 2));
  Logger.log('CSS String length: ' + PortalStylesCSS.length + ' characters');
}
