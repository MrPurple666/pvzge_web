package com.pvzge.gardendless;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.graphics.Color;
import android.webkit.WebChromeClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Hide status bar and navigation bar for fullscreen gaming experience
    getWindow().getDecorView().setSystemUiVisibility(
        View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_FULLSCREEN
        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
    );
    
    // Keep screen on during gameplay
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

    // Get WebView reference
    WebView webView = bridge.getWebView();

    // Configure WebView for games
    WebSettings settings = webView.getSettings();

    // Disable zoom completely
    settings.setBuiltInZoomControls(false);
    settings.setDisplayZoomControls(false);
    settings.setUseWideViewPort(false);
    settings.setLoadWithOverviewMode(false);
    settings.setSupportZoom(false);

    // Set proper scale
    settings.setDefaultZoom(WebSettings.ZoomDensity.MEDIUM);

    // Enable JavaScript (required for Cocos)
    settings.setJavaScriptEnabled(true);
    settings.setJavaScriptCanOpenWindowsAutomatically(false);

    // DOM Storage
    settings.setDomStorageEnabled(true);
    settings.setDatabaseEnabled(true);

    // Improve rendering
    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

    // Enable hardware acceleration
    webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

    // Set background to transparent to fix black background issue
    webView.setBackgroundColor(Color.TRANSPARENT);
    
    // Enable WebGL and advanced graphics features
    settings.setJavaScriptEnabled(true);
    settings.setAllowUniversalAccessFromFileURLs(true);
    settings.setAllowFileAccessFromFileURLs(true);
    settings.setDomStorageEnabled(true);
    settings.setDatabaseEnabled(true);
    settings.setLoadWithOverviewMode(true);
    settings.setUseWideViewPort(true);
    settings.setSupportMultipleWindows(true);
    settings.setAllowContentAccess(true);
    settings.setAllowFileAccess(true);
    
    // Additional WebGL settings
    settings.setGeolocationEnabled(false);
    settings.setMediaPlaybackRequiresUserGesture(false);
    
    // Enable advanced WebGL features for better performance
    settings.setDomStorageEnabled(true);
    settings.setDatabaseEnabled(true);
    settings.setSaveFormData(false);
    
    // Set WebChromeClient to handle WebGL settings
    webView.setWebChromeClient(new WebChromeClient() {
        // Enable WebGL 2.0 support on Android
        @Override
        public boolean onConsoleMessage(android.webkit.ConsoleMessage consoleMessage) {
            // Allow WebGL 2.0 context creation
            return true;
        }
    });
    
    // Enable hardware acceleration for better WebGL performance
    webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
    
    // Set hardware acceleration properties for WebGL
    webView.setDrawingCacheBackgroundColor(0x00000000);
    webView.setWillNotCacheDrawing(false);
    webView.setDrawingCacheEnabled(false);

    // Ensure touch events are not blocked
    webView.setFocusable(true);
    webView.setFocusableInTouchMode(true);

    // Remove padding/margin that might interfere
    webView.setPadding(0, 0, 0, 0);
    webView.setClipToPadding(false);

    // Layout parameters
    ViewGroup.LayoutParams params = webView.getLayoutParams();
    if (params != null) {
      params.width = ViewGroup.LayoutParams.MATCH_PARENT;
      params.height = ViewGroup.LayoutParams.MATCH_PARENT;
      webView.setLayoutParams(params);
    }
    
    // Additional rendering optimizations for game
    webView.setOverScrollMode(View.OVER_SCROLL_NEVER); // Disable overscroll glow
    webView.setHorizontalScrollBarEnabled(false);
    webView.setVerticalScrollBarEnabled(false);
  }
}
