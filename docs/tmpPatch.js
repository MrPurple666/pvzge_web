// ============================================
// ANDROID ASSET & TOUCH FIX - PvZ2 Gardendless
// ============================================

console.log('🔴 TMPPATCH.JS LOADED - INICIO');

// FIX 0: Intercept XMLHttpRequest (Cocos uses this!)
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  let fixedUrl = url;
  if (url && typeof url === 'string' && url.startsWith('/')) {
    fixedUrl = url.substring(1);
  }
  return originalOpen.call(this, method, fixedUrl, ...args);
};

// Also intercept fetch
const originalFetch = window.fetch;
window.fetch = function(resource, init) {
  let url = typeof resource === 'string' ? resource : resource.url;
  if (url && typeof url === 'string' && url.startsWith('/')) {
    url = url.substring(1);
  }
  if (typeof resource === 'string') {
    return originalFetch.call(this, url, init);
  } else {
    resource.url = url;
    return originalFetch.call(this, resource, init);
  }
};

// Helper: Create synthetic pointer event
function createPointerEvent(type, touch) {
  const pointerEvent = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: touch.clientX,
    clientY: touch.clientY,
    screenX: touch.screenX,
    screenY: touch.screenY,
    pointerId: touch.identifier || 0,
    pointerType: 'touch',
    isPrimary: true
  });
  return pointerEvent;
}

// Helper: Create synthetic mouse event
function createMouseEvent(type, touch) {
  const mouseEvent = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: touch.clientX,
    clientY: touch.clientY,
    screenX: touch.screenX,
    screenY: touch.screenY,
    buttons: type === 'mousemove' ? 1 : 0
  });
  return mouseEvent;
}

// Store touch state
window._touchActive = false;
window._lastTouchCoords = { x: 0, y: 0 };

function forwardTouchEvent(e, type) {
  const touchList = type === 'touchend' || type === 'touchcancel' ? e.changedTouches : e.touches;
  if (touchList.length > 0) {
    const touch = touchList[0];
    window._lastTouchCoords = { x: touch.clientX, y: touch.clientY };

    const currentCanvas = document.querySelector('canvas');
    const currentGameDiv = document.getElementById('GameDiv');

    try {
      const pointerEvent = createPointerEvent(type.replace('touch', 'pointer'), touch);
      if (currentCanvas) currentCanvas.dispatchEvent(pointerEvent);
      document.dispatchEvent(pointerEvent);
    } catch (err) {
      // Silently fail
    }

    const mouseType = type === 'touchstart' ? 'mousedown' : type === 'touchmove' ? 'mousemove' : 'mouseup';
    const mouseEvent = createMouseEvent(mouseType, touch);
    if (currentCanvas) currentCanvas.dispatchEvent(mouseEvent);
    document.dispatchEvent(mouseEvent);
    if (currentGameDiv) currentGameDiv.dispatchEvent(mouseEvent);
  }
}

// Listen to touch events
document.addEventListener('touchstart', function(e) {
  window._touchActive = true;
  forwardTouchEvent(e, 'touchstart');
}, { capture: true, passive: true });

document.addEventListener('touchmove', function(e) {
  if (window._touchActive) {
    forwardTouchEvent(e, 'touchmove');
  }
}, { capture: true, passive: true });

document.addEventListener('touchend', function(e) {
  window._touchActive = false;
  forwardTouchEvent(e, 'touchend');

  if (e.changedTouches.length > 0) {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const currentCanvas = document.querySelector('canvas');

    if (target && target !== currentCanvas) {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      target.dispatchEvent(clickEvent);
    }
  }
}, { capture: true, passive: true });

document.addEventListener('touchcancel', function(e) {
  window._touchActive = false;
  forwardTouchEvent(e, 'touchcancel');
}, { capture: true, passive: true });

// Fix: Make sure touch-action is none
if (document.documentElement) {
  document.documentElement.style.touchAction = 'none';
  document.body.style.touchAction = 'none';
}

// Fix: Disable problematic gestures
document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
}, { capture: true });

document.addEventListener('dblclick', function(e) {
  e.preventDefault();
}, { capture: true });

// Fix: Ensure canvas matches window size
function applyCanvasResize() {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    setTimeout(applyCanvasResize, 500);
    return;
  }

  function resizeCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.style.display = 'block';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.margin = '0';
    canvas.style.padding = '0';
    console.log('[PvZ2] Canvas resized to:', w, 'x', h);
  }

  resizeCanvas();
  window.addEventListener('orientationchange', resizeCanvas);
  window.addEventListener('resize', resizeCanvas);
}

setTimeout(applyCanvasResize, 100);

console.log('[PvZ2] Android touch fix initialized');

// ============================================
// ELECTRON COMPATIBILITY
// ============================================

const electron = {
  isFullscreen: () => {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
  },
  enterFullscreen: (element = document.documentElement) => {
    if (document.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  },
  exitFullscreen: () => {
    if (electron.isFullscreen() && document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  },
  ipcRenderer: {
    send: function (channel, ...data) {
      switch (channel) {
        case "e_isFullScreen":
          return electron.isFullscreen();
        case "e_fullScreen":
          return electron.isFullscreen() ? electron.exitFullscreen() : electron.enterFullscreen();
        case "e_window":
          return electron.exitFullscreen();
        case "e_openURL":
          return electron.shell.openExternal(data[0]);
      }
    },
    sendSync: function (channel, data) {
      switch (channel) {
        case "e_isFullScreen":
          return electron.isFullscreen();
      }
    },
    on: function (channel, callback) {
    }
  },
  shell: {
    openExternal: function (url) {
      return window.open(url, '_blank');
    }
  }
};

window.electron = electron;

// ============================================
// ANDROID WEBVIEW OPTIMIZATION
// ============================================

if (navigator.userAgent.toLowerCase().includes('android')) {
  document.body.style.userSelect = 'none';
  document.body.style.WebkitUserSelect = 'none';
  document.body.style.WebkitTouchCallout = 'none';

  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.touchAction = 'none';
    canvas.style.userSelect = 'none';
    canvas.style.WebkitUserSelect = 'none';
  }
}

console.log('🔴 TMPPATCH.JS FIM');
