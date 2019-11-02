package com.eggmatters.locator_app;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import android.net.http.SslError;
import android.util.Log;
import android.webkit.SslErrorHandler;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

import java.net.URLEncoder;

public class DisplayMessageActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_display_message);

        Intent intent = getIntent();
        String message = intent.getStringExtra(MainActivity.EXTRA_MESSAGE);
        TextView textView = findViewById(R.id.textView);
        textView.setText(message);
        setWebView();
    }

    private void setWebView() {
        WebView myWebView = (WebView) findViewById(R.id.testWebView);
        WebSettings myWebSettings = myWebView.getSettings();
        myWebSettings.setJavaScriptEnabled(true);
        myWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                Log.d("TAG", "onReceivedSslError: " + error.toString());
                handler.proceed();
            }
        });

        String payload = "bus_number=" + URLEncoder.encode("76");
        //myWebView.postUrl("http://127.0.1.5/fetch", payload.getBytes());
        //myWebView.postUrl("http://localhost:3000/locator/fetch", payload.getBytes());
        myWebView.postUrl(MainActivity.EGGMATTERS_COM, payload.getBytes() );
        //2019-03-14 07:01:07.931 20606-20606/com.eggmatters.locator_app I/chromium:
        // [INFO:CONSOLE(23)] "ERROR(1): Only secure origins are allowed (see: https://goo.gl/Y0ZkNV).", source: http://10.0.2.2:3000/js/esri.js (23)
    }
}
