// Cognitive Care Portal - Dynamic Styling Module
// This module provides functions to apply and manage portal styles dynamically

const CognitivePortalStyles = {
  // Color Palette
  colors: {
    darkBlue: '#062146',
    teal: '#80EEDF',
    darkTeal: '#094F48',
    lightGray: '#F1F3F5',
    white: '#ffffff',
    borderGray: '#E2E8F0',
    darkBorderGray: '#CBD5E1',
  },

  // Apply active state to navigation item
  activateNavItem(element) {
    // Remove active class from siblings
    const siblings = element.parentElement.querySelectorAll('.nav-item');
    siblings.forEach(item => item.classList.remove('active'));
    
    // Apply active to current element
    element.classList.add('active');
    element.style.backgroundColor = this.colors.darkBlue;
    element.style.color = this.colors.white;
  },

  // Apply input box styling
  styleInputBox(inputElement) {
    // Initial state
    inputElement.style.backgroundColor = this.colors.lightGray;
    inputElement.style.border = `1.5px solid transparent`;
    inputElement.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    inputElement.style.padding = '12px 16px';
    inputElement.style.borderRadius = '8px';
    inputElement.style.fontSize = '14px';

    // Focus state
    inputElement.addEventListener('focus', () => {
      inputElement.style.backgroundColor = this.colors.white;
      inputElement.style.borderColor = this.colors.teal;
      inputElement.style.boxShadow = `0 0 0 4px rgba(128, 238, 223, 0.25)`;
    });

    // Blur state
    inputElement.addEventListener('blur', () => {
      inputElement.style.backgroundColor = this.colors.lightGray;
      inputElement.style.borderColor = 'transparent';
      inputElement.style.boxShadow = 'none';
    });
  },

  // Apply card shadow
  styleCard(cardElement) {
    cardElement.style.boxShadow = `0 25px 50px -12px rgba(6, 33, 70, 0.09), 0 4px 20px -2px rgba(0, 0, 0, 0.04)`;
    cardElement.style.borderRadius = '12px';
    cardElement.style.backgroundColor = this.colors.white;
  },

  // Make element audio-speakable
  makeAudioSpeakable(element) {
    element.style.transition = 'color 0.15s ease';
    element.style.userSelect = 'none';
    element.style.cursor = 'pointer';
    element.style.color = this.colors.darkTeal;
    element.style.fontWeight = '500';
    element.style.padding = '8px 12px';
    element.style.borderRadius = '4px';
    element.style.display = 'inline-block';

    // Hover effect
    element.addEventListener('mouseenter', () => {
      element.style.color = this.colors.darkBlue;
      element.style.backgroundColor = 'rgba(128, 238, 223, 0.1)';
    });

    element.addEventListener('mouseleave', () => {
      if (!element.classList.contains('speaking')) {
        element.style.color = this.colors.darkTeal;
        element.style.backgroundColor = 'transparent';
      }
    });

    // Click to speak
    element.addEventListener('click', () => {
      this.toggleAudioSpeaking(element);
    });
  },

  // Toggle audio speaking animation
  toggleAudioSpeaking(element) {
    element.classList.toggle('speaking');
    
    if (element.classList.contains('speaking')) {
      // Inject animation styles if not already present
      this.injectSpeakingAnimation();
      
      // Apply speaking styles
      element.style.animation = 'speak-pulse 1.2s infinite ease-in-out';
      element.style.color = this.colors.darkTeal;

      // Auto-stop after 2 seconds
      setTimeout(() => {
        element.classList.remove('speaking');
        element.style.animation = 'none';
        element.style.color = this.colors.darkTeal;
      }, 2000);
    } else {
      element.style.animation = 'none';
    }
  },

  // Inject speaking animation keyframes
  injectSpeakingAnimation() {
    if (document.getElementById('speak-pulse-animation')) {
      return; // Already injected
    }

    const style = document.createElement('style');
    style.id = 'speak-pulse-animation';
    style.textContent = `
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
    document.head.appendChild(style);
  },

  // Apply custom scrollbar styling to element
  styleScrollbar(element) {
    const style = document.createElement('style');
    style.textContent = `
      element {
        scrollbar-width: thin;
        scrollbar-color: ${this.colors.borderGray} transparent;
      }
      element::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      element::-webkit-scrollbar-track {
        background: transparent;
      }
      element::-webkit-scrollbar-thumb {
        background: ${this.colors.borderGray};
        border-radius: 9999px;
      }
      element::-webkit-scrollbar-thumb:hover {
        background: ${this.colors.darkBorderGray};
      }
    `;
    document.head.appendChild(style);
  },

  // Initialize all styles on page load
  initializePortal() {
    // Style all input boxes
    document.querySelectorAll('.input-box').forEach(input => {
      this.styleInputBox(input);
    });

    // Style all cards
    document.querySelectorAll('.login-card').forEach(card => {
      this.styleCard(card);
    });

    // Make elements audio-speakable
    document.querySelectorAll('.audio-speakable').forEach(element => {
      this.makeAudioSpeakable(element);
    });

    // Style navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => this.activateNavItem(item));
    });

    // Inject speaking animation
    this.injectSpeakingAnimation();

    console.log('✅ Cognitive Care Portal styles initialized');
  },
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  CognitivePortalStyles.initializePortal();
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CognitivePortalStyles;
}
