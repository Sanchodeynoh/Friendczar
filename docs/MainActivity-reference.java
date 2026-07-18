// This is a REFERENCE file, not one Capacitor generates automatically.
// After running `npx cap add android` on your computer, Capacitor creates
// a real MainActivity.java at:
//   android/app/src/main/java/net/friendczar/app/MainActivity.java
// Open that generated file and replace its contents with this, so calls
// and live streaming (which need camera/mic access) actually work inside
// the packaged app. Without this, getUserMedia() silently fails on Android.

package net.friendczar.app;

import android.Manifest;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private static final int PERMISSION_REQUEST_CODE = 1;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Ask the user for camera + microphone access up front.
    ActivityCompat.requestPermissions(
        this,
        new String[] {Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO},
        PERMISSION_REQUEST_CODE
    );

    // When the web page (React app) itself asks for camera/mic via
    // getUserMedia, the Android WebView needs to be told to allow it.
    this.bridge.getWebView().setWebChromeClient(new WebChromeClient() {
      @Override
      public void onPermissionRequest(final PermissionRequest request) {
        runOnUiThread(() -> request.grant(request.getResources()));
      }
    });
  }
}
