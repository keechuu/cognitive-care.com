// Cognitive Care Portal - CSS-in-JS Object Format
// Use this with React (styled-components, CSS Modules), Vue (scoped styles), or other frameworks

export const PortalStyles = {
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

  // Scrollbar styles (for custom scrollbar appearance)
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

// Color palette - can be used globally
export const Colors = {
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

// Animations
export const Animations = {
  speakPulse: `
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
  `,
};

// Utility functions for React/Vue
export const usePortalStyles = () => {
  return {
    getNavItemClasses: (isActive) => {
      const baseClass = PortalStyles.navItem;
      return isActive ? { ...baseClass, ...PortalStyles.navItemActive } : baseClass;
    },

    getInputClasses: (isFocused) => {
      const baseClass = PortalStyles.inputBox;
      return isFocused ? { ...baseClass, ...PortalStyles.inputBoxFocus } : baseClass;
    },

    getAudioClasses: (isHovered, isSpeaking) => {
      let classes = PortalStyles.audioSpeakable;
      if (isHovered) classes = { ...classes, ...PortalStyles.audioSpeakableHover };
      if (isSpeaking) classes = { ...classes, ...PortalStyles.audioSpeaking };
      return classes;
    },
  };
};

// Example usage with React (styled-components):
/*
import styled from 'styled-components';
import { PortalStyles, Colors, Animations } from './styles-object';

const NavItem = styled.div`
  ${Object.entries(PortalStyles.navItem)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n')}
  
  &.active {
    ${Object.entries(PortalStyles.navItemActive)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n')}
  }
`;

const InputBox = styled.input`
  ${Object.entries(PortalStyles.inputBox)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n')}
  
  &:focus {
    ${Object.entries(PortalStyles.inputBoxFocus)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n')}
  }
`;
*/

// Example usage with Vue (scoped styles):
/*
<style scoped>
.nav-item {
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  transition: all 0.2s ease;
}

.nav-item.active {
  background-color: #062146;
  color: #ffffff;
}

.input-box {
  background-color: #F1F3F5;
  border: 1.5px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 12px 16px;
  border-radius: 8px;
}

.input-box:focus {
  background-color: #ffffff;
  border-color: #80EEDF;
  box-shadow: 0 0 0 4px rgba(128, 238, 223, 0.25);
}
</style>
*/

export default PortalStyles;
