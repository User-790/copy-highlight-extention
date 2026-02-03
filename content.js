let isEnabled = false;
let currentElement = null;

// Toggle extension on/off with ALT+C
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 'c') {
    isEnabled = !isEnabled;
    
    // Remove any existing borders when disabling
    if (!isEnabled && currentElement) {
      currentElement.style.outline = '';
      currentElement.style.backgroundColor = '';
      currentElement = null;
    }
    
    // Show status message
    showStatus(isEnabled ? '✓ Extension Enabled' : '✗ Extension Disabled');
  }
});

// Handle mouse movement to detect text sections
document.addEventListener('mouseover', (e) => {
  if (!isEnabled) return;
  
  // Remove highlight from previous element
  if (currentElement && currentElement !== e.target) {
    currentElement.style.outline = '';
    currentElement.style.backgroundColor = '';
  }
  
  // Only highlight elements that contain text
  const element = e.target;
  const hasText = element.innerText && element.innerText.trim().length > 0;
  
  if (hasText) {
    currentElement = element;
    // Add dotted border and light background highlight
    currentElement.style.outline = '2px dotted #007bff';
    currentElement.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
  }
});

document.addEventListener('mouseout', (e) => {
  if (!isEnabled) return;
  
  // Remove highlight when mouse leaves
  if (e.target === currentElement) {
    e.target.style.outline = '';
    e.target.style.backgroundColor = '';
  }
});

// Copy with formatting preserved - LEFT CLICK
document.addEventListener('click', (e) => {
  if (!isEnabled) return;
  
  // Only trigger on left mouse button
  if (e.button !== 0) return;
  
  const element = e.target;
  
  // Check if element has text
  if (!element.innerText || element.innerText.trim().length === 0) return;
  
  // Prevent default action to avoid interfering with page links
  e.preventDefault();
  
  try {
    // Create a range and selection to copy HTML with formatting
    const range = document.createRange();
    range.selectNodeContents(element);
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Copy both plain text and HTML to clipboard
    const plainText = element.innerText || element.textContent;
    const htmlContent = element.innerHTML;
    
    // Use the Clipboard API to write both formats
    const clipboardItem = new ClipboardItem({
      'text/plain': new Blob([plainText], { type: 'text/plain' }),
      'text/html': new Blob([htmlContent], { type: 'text/html' })
    });
    
    navigator.clipboard.write([clipboardItem]).then(() => {
      showStatus('✓ Text copied successfully!', 'success');
      // Clear selection
      selection.removeAllRanges();
    }).catch(err => {
      // Fallback to plain text if HTML copy fails
      navigator.clipboard.writeText(plainText).then(() => {
        showStatus('✓ Text copied successfully!', 'success');
        selection.removeAllRanges();
      }).catch(() => {
        showStatus('✗ Failed to copy text', 'error');
      });
    });
    
  } catch (err) {
    // Fallback method
    const text = element.innerText || element.textContent;
    navigator.clipboard.writeText(text.trim()).then(() => {
      showStatus('✓ Text copied successfully!', 'success');
    }).catch(() => {
      showStatus('✗ Failed to copy text', 'error');
    });
  }
});

// Show status message with different styles
function showStatus(message, type = 'info') {
  // Remove any existing status messages first
  const existingStatus = document.querySelector('.section-highlighter-status');
  if (existingStatus) {
    existingStatus.remove();
  }
  
  const statusDiv = document.createElement('div');
  statusDiv.className = 'section-highlighter-status';
  statusDiv.textContent = message;
  
  // Different colors based on type
  let bgColor = '#333';
  if (type === 'success') {
    bgColor = '#28a745'; // Green
  } else if (type === 'error') {
    bgColor = '#dc3545'; // Red
  }
  
  statusDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(statusDiv);
  
  setTimeout(() => {
    statusDiv.style.transition = 'opacity 0.3s ease-out';
    statusDiv.style.opacity = '0';
    setTimeout(() => {
      statusDiv.remove();
      style.remove();
    }, 300);
  }, 2500);
}
