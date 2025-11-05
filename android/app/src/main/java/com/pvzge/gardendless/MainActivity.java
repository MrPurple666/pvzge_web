package com.pvzge.gardendless;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.View;
import android.view.ViewGroup;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

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

    // Ensure touch events are not blocked
    webView.setFocusable(true);
    webView.setFocusableInTouchMode(true);

    // Remove padding/margin that might interfere
    webView.setPadding(0, 0, 0, 0);

    // Layout parameters
    ViewGroup.LayoutParams params = webView.getLayoutParams();
    if (params != null) {
      params.width = ViewGroup.LayoutParams.MATCH_PARENT;
      params.height = ViewGroup.LayoutParams.MATCH_PARENT;
      webView.setLayoutParams(params);
    }
  }
}
