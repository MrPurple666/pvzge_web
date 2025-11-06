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

// FIX: WebGL Context Configuration for transparent background
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(contextType, contextAttributes) {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    if (!contextAttributes) contextAttributes = {};
    
    // Ensure transparency works properly
    contextAttributes.alpha = true;
    contextAttributes.premultipliedAlpha = true;
    contextAttributes.preserveDrawingBuffer = true;
    contextAttributes.antialias = true; // Enable for better rendering quality on mobile
    contextAttributes.stencil = true; // Enable stencil buffer
    
    console.log('[PvZ2] WebGL context configured with alpha and transparency');
  }
  return originalGetContext.call(this, contextType, contextAttributes);
};

// FIX: Force initial WebGL context creation and rendering for Cocos engine
function initWebGLForCocos() {
  console.log('[PvZ2] Initializing WebGL fixes for Cocos');
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupWebGLFix);
  } else {
    setupWebGLFix();
  }
  
  function setupWebGLFix() {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      console.error('[PvZ2] Canvas element not found!');
      return;
    }
    
    // Set canvas background to transparent initially
    canvas.style.backgroundColor = 'transparent';
    
    // Ensure the canvas is properly sized
    const resizeCanvas = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    
    // Get WebGL context and configure it
    let context = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      antialias: true,
      failIfMajorPerformanceCaveat: false,
      stencil: true,
      powerPreference: "high-performance"
    }) || canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      antialias: true,
      failIfMajorPerformanceCaveat: false,
      stencil: true,
      powerPreference: "high-performance"
    }) || canvas.getContext('experimental-webgl', {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      antialias: true,
      failIfMajorPerformanceCaveat: false,
      stencil: true,
      powerPreference: "high-performance"
    });
    
    if (context) {
      console.log('[PvZ2] WebGL context created successfully');
      console.log('[PvZ2] WebGL version: ' + (context.getParameter(context.VERSION) || 'Unknown'));
      
      // Set initial clear color to transparent
      context.clearColor(0.0, 0.0, 0.0, 0.0);
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
      
      // Determine if this is WebGL 2.0 context and enable appropriate features
      const isWebGL2 = context.constructor.name === 'WebGL2RenderingContext' || 
                     (context.getParameter && context.getParameter(context.VERSION) && 
                      context.getParameter(context.VERSION).toLowerCase().includes('webgl2'));
      
      if (isWebGL2) {
        console.log('[PvZ2] Using WebGL 2.0 - Performance optimizations enabled');
        // WebGL 2.0 specific optimizations
        try {
          // Enable anisotropic filtering if available
          const ext = context.getExtension('EXT_texture_filter_anisotropic') ||
                     context.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                     context.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
          if (ext) {
            const maxAnisotropy = context.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            console.log('[PvZ2] Anisotropic filtering supported, max level:', maxAnisotropy);
          }
        } catch(e) {
          console.log('[PvZ2] Anisotropic filtering not supported');
        }
      } else {
        console.log('[PvZ2] Using WebGL 1.0 - Consider enabling WebGL 2.0 for better performance');
      }
      
      // Patch the Cocos cc.game.run method to ensure WebGL context is properly set up
      if (window.cc && window.cc.game) {
        const originalRun = window.cc.game.run;
        window.cc.game.run = function() {
          console.log('[PvZ2] Running game with WebGL fixes');
          
          // Apply WebGL settings before running
          if (context) {
            context.clearColor(0.0, 0.0, 0.0, 0.0);
            context.enable(context.DEPTH_TEST);
            context.enable(context.BLEND);
            context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
            context.enable(context.STENCIL_TEST);
            
            // Additional performance optimizations for WebGL 2.0
            if (isWebGL2) {
              context.enable(context.TEXTURE_WRAP_S);
              context.enable(context.TEXTURE_WRAP_T);
            }
          }
          
          return originalRun.call(this);
        };
      }
    } else {
      console.error('[PvZ2] Failed to create WebGL context');
    }
  }
}

// Enhanced fix to ensure proper rendering after Cocos initialization
function forceRenderFix() {
  if (window.cc && window.cc.game && window.cc.game._renderContext) {
    const context = window.cc.game._renderContext;
    if (context) {
      context.clearColor(0.0, 0.0, 0.0, 0.0);
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    }
  }
}

// Apply the patches
initWebGLForCocos();

// Also try to patch after loading the Cocos engine
window.addEventListener('load', function() {
  setTimeout(function() {
    // Force render fix multiple times during initialization
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (window.cc && window.cc.game) {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            const context = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (context) {
              // Apply additional WebGL fixes after engine initialization
              context.clearColor(0.0, 0.0, 0.0, 0.0);
              context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
              context.enable(context.BLEND);
              context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
            }
          }
          forceRenderFix();
        }
      }, 1000 * i);
    }
  }, 1000); // Wait 1 second after load to ensure Cocos is initialized
});

// Monitor for when cc becomes available if not already available
if (!window.cc) {
  const ccObserver = setInterval(() => {
    if (window.cc) {
      console.log('[PvZ2] Cocos engine detected, applying patches');
      clearInterval(ccObserver);
      
      if (window.cc.game) {
        const originalRun = window.cc.game.run;
        window.cc.game.run = function() {
          console.log('[PvZ2] Intercepting cc.game.run for WebGL fixes');
          
          const canvas = document.querySelector('canvas');
          if (canvas) {
            let context = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (context) {
              context.clearColor(0.0, 0.0, 0.0, 0.0);
              context.enable(context.BLEND);
              context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
              context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
            }
          }
          
          // Run the original function but with a delay to allow context to be properly set up
          setTimeout(() => {
            originalRun.call(this);
          }, 500);
          
          return undefined; // Prevent the original function from running immediately
        };
      }
    }
  }, 100);
}

// Final safety net: try to clear the canvas if it's still black
setTimeout(() => {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (context) {
      context.clearColor(0.0, 0.0, 0.0, 0.0);
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    }
  }
}, 3000);

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

// Additional fix: Handle Cocos resolution adaptation to remove side borders
function handleResolutionAdaptation() {
  // Wait for Cocos to be initialized
  const checkAndFix = setInterval(() => {
    if (window.cc && window.cc.view) {
      clearInterval(checkAndFix);
      
      // Configure the view to properly handle different screen ratios
      const view = cc.view;
      
      // Set the design resolution and policy to better handle mobile screens
      // This prevents the side borders by using a more appropriate scaling policy
      if (view.setDesignResolutionSize) {
        // Get current canvas size
        const width = view.getCanvasSize ? view.getCanvasSize().width : window.innerWidth;
        const height = view.getCanvasSize ? view.getCanvasSize().height : window.innerHeight;
        
        // Use SHOW_ALL policy which maintains aspect ratio without borders on sides
        // This is better than EXACT_FIT for handling different screen ratios
        view.setDesignResolutionSize(1024, 640, cc.ResolutionPolicy.SHOW_ALL);
        
        console.log('[PvZ2] Resolution adaptation configured with SHOW_ALL policy');
        
        // Adjust viewport to ensure no clipping
        if (view.setFrameZoomFactor) {
          view.setFrameZoomFactor(1.0);
        }
      }
    }
  }, 500);
}

// Apply resolution adaptation fix
setTimeout(handleResolutionAdaptation, 2000);

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
