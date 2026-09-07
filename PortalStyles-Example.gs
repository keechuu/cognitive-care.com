// Cognitive Care Portal - Google Apps Script Usage Examples
// This file shows how to use PortalStyles.gs in your Google Apps Script projects

// ============================================
// EXAMPLE 1: Create an HTML UI with Portal Styles
// ============================================

function createPortalUI() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Cognitive Care Portal</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
          }
          
          h1 {
            color: #062146;
            text-align: center;
          }
        </style>
        <!-- Portal Styles -->
        <style>
          .nav-item.active {
            background-color: #062146 !important;
            color: #ffffff !important;
          }

          .input-box {
            background-color: #F1F3F5;
            border: 1.5px solid transparent;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 12px 16px;
            border-radius: 8px;
            width: 100%;
            font-size: 14px;
            margin-bottom: 12px;
          }

          .input-box:focus {
            outline: none;
            background-color: #ffffff;
            border-color: #80EEDF;
            box-shadow: 0 0 0 4px rgba(128, 238, 223, 0.25);
          }

          .login-card {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 25px 50px -12px rgba(6, 33, 70, 0.09), 0 4px 20px -2px rgba(0, 0, 0, 0.04);
          }

          .audio-speakable {
            transition: color 0.15s ease;
            user-select: none;
            cursor: pointer;
            color: #094F48;
            font-weight: 500;
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
          }

          .audio-speakable:hover {
            color: #062146;
            background-color: rgba(128, 238, 223, 0.1);
          }

          button {
            background-color: #094F48;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s;
            width: 100%;
          }

          button:hover {
            background-color: #062146;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏥 Cognitive Care Portal</h1>
          
          <div class="login-card">
            <h3 style="color: #062146; margin-top: 0;">Patient Login</h3>
            
            <input type="text" class="input-box" placeholder="Patient ID or Email">
            <input type="password" class="input-box" placeholder="Password">
            
            <button>Sign In</button>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">Need assistance?</p>
              <div class="audio-speakable">🔊 Listen to Instructions</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const ui = HtmlService.createHtmlOutput(html);
  ui.setWidth(700);
  ui.setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(ui, 'Cognitive Care Portal');
}

// ============================================
// EXAMPLE 2: Use Portal Styles in a Sidebar
// ============================================

function showPortalSidebar() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 16px;
          }
          
          .nav-item {
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 8px;
            cursor: pointer;
            background-color: transparent;
            color: #333;
            transition: all 0.2s ease;
          }

          .nav-item:hover {
            background-color: #f0f0f0;
          }

          .nav-item.active {
            background-color: #062146;
            color: #ffffff;
          }

          .input-box {
            background-color: #F1F3F5;
            border: 1.5px solid transparent;
            padding: 12px 16px;
            border-radius: 8px;
            width: 100%;
            font-size: 14px;
            margin-bottom: 12px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .input-box:focus {
            outline: none;
            background-color: #ffffff;
            border-color: #80EEDF;
            box-shadow: 0 0 0 4px rgba(128, 238, 223, 0.25);
          }
        </style>
      </head>
      <body>
        <h2 style="color: #062146;">Menu</h2>
        
        <div class="nav-item active">📊 Dashboard</div>
        <div class="nav-item">👤 Patient Profile</div>
        <div class="nav-item">📋 Assessments</div>
        <div class="nav-item">⚙️ Settings</div>
        
        <hr>
        
        <h3 style="color: #062146;">Search</h3>
        <input type="text" class="input-box" placeholder="Search patients...">
      </body>
    </html>
  `;

  const ui = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showSidebar(ui);
}

// ============================================
// EXAMPLE 3: Programmatically Apply Styles
// ============================================

function getStyleString(styleName) {
  // Reference the PortalStyles object
  // This assumes PortalStyles.gs is in the same project
  
  const styleMap = {
    'navItem': PortalStyles.navItem,
    'inputBox': PortalStyles.inputBox,
    'card': PortalStyles.loginCard,
    'audio': PortalStyles.audioSpeakable,
  };

  const style = styleMap[styleName];
  if (!style) return '';

  // Convert object to CSS string
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return cssKey + ': ' + value;
    })
    .join('; ');
}

// ============================================
// EXAMPLE 4: Create a Dynamic Assessment Form
// ============================================

function createAssessmentForm() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f8f9fa;
          }

          .card {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 25px 50px -12px rgba(6, 33, 70, 0.09), 0 4px 20px -2px rgba(0, 0, 0, 0.04);
            max-width: 500px;
            margin: 0 auto;
          }

          .card h2 {
            color: #062146;
            margin-top: 0;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
          }

          .input-box {
            background-color: #F1F3F5;
            border: 1.5px solid transparent;
            padding: 12px 16px;
            border-radius: 8px;
            width: 100%;
            font-size: 14px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .input-box:focus {
            outline: none;
            background-color: #ffffff;
            border-color: #80EEDF;
            box-shadow: 0 0 0 4px rgba(128, 238, 223, 0.25);
          }

          button {
            background-color: #094F48;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            width: 100%;
            font-size: 14px;
          }

          button:hover {
            background-color: #062146;
          }

          .audio-help {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #eee;
          }

          .audio-speakable {
            color: #094F48;
            cursor: pointer;
            text-decoration: underline;
            font-weight: 500;
          }

          .audio-speakable:hover {
            color: #062146;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Cognitive Assessment</h2>
          
          <form>
            <div class="form-group">
              <label>Patient Name</label>
              <input type="text" class="input-box" placeholder="Enter full name">
            </div>

            <div class="form-group">
              <label>Date of Birth</label>
              <input type="date" class="input-box">
            </div>

            <div class="form-group">
              <label>Assessment Date</label>
              <input type="date" class="input-box">
            </div>

            <div class="form-group">
              <label>Comments</label>
              <textarea class="input-box" rows="4" placeholder="Add assessment notes..."></textarea>
            </div>

            <button type="submit">Submit Assessment</button>

            <div class="audio-help">
              <p style="font-size: 12px; color: #666; margin: 0 0 8px 0;">Need help?</p>
              <span class="audio-speakable">🔊 Listen to form instructions</span>
            </div>
          </form>
        </div>
      </body>
    </html>
  `;

  const ui = HtmlService.createHtmlOutput(html);
  ui.setWidth(600);
  ui.setHeight(700);
  
  SpreadsheetApp.getUi().showModalDialog(ui, 'Patient Assessment');
}

// ============================================
// Run these functions in Google Apps Script:
// ============================================
// createPortalUI()
// showPortalSidebar()
// createAssessmentForm()
