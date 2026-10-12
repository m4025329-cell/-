package ru.pervyistolik.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;

/**
 * Окно игры: показывает index.html из папки assets/www внутри WebView.
 * Игра открывается по адресу https://appassets.androidplatform.net/assets/www/index.html, поэтому
 * localStorage (сохранение игры) работает так же, как в обычном браузере, а интернет не нужен.
 * Файлы отдаются из assets без сети. Сторонних библиотек нет.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/assets/www/index.html";
    private WebView webView;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(Color.parseColor("#FFF6E7")));
        getWindow().setStatusBarColor(Color.parseColor("#FFF6E7"));
        getWindow().setNavigationBarColor(Color.parseColor("#FFF6E7"));
        // тёмные значки на светлых панелях: 0x2000 = светлая строка состояния, 0x10 = светлая панель навигации
        View decor = getWindow().getDecorView();
        int flags = decor.getSystemUiVisibility() | 0x2000;
        if (Build.VERSION.SDK_INT >= 26) {
            flags |= 0x10;
        }
        decor.setSystemUiVisibility(flags);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#FFF6E7"));
        setContentView(webView);
        applyInsets();

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage: сохранение игры
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setTextZoom(100);                    // системный масштаб шрифта не ломает вёрстку
        s.setMediaPlaybackRequiresUserGesture(false);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return serve(request.getUrl());
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Остаёмся внутри игры: внешние ссылки не открываем (на новых версиях Android этот метод вызывает система)
                return !url.startsWith("https://" + HOST + "/");
            }
        });

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(START_URL);
        }
    }

    /** Отдаёт файл из assets по адресу вида https://appassets.androidplatform.net/assets/www/index.html. */
    private WebResourceResponse serve(Uri uri) {
        if (!HOST.equals(uri.getHost())) {
            return null;
        }
        String path = uri.getPath();
        if (path == null || !path.startsWith("/assets/") || path.contains("..")) {
            return notFound();
        }
        String rel = path.substring("/assets/".length());
        try {
            InputStream in = getAssets().open(rel);
            return new WebResourceResponse(mime(rel), "utf-8", in);
        } catch (IOException e) {
            return notFound();
        }
    }

    private static WebResourceResponse notFound() {
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", null, null);
    }

    private static String mime(String name) {
        String n = name.toLowerCase(Locale.ROOT);
        if (n.endsWith(".html")) return "text/html";
        if (n.endsWith(".js")) return "text/javascript";
        if (n.endsWith(".css")) return "text/css";
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".svg")) return "image/svg+xml";
        if (n.endsWith(".webmanifest") || n.endsWith(".json")) return "application/json";
        return "application/octet-stream";
    }

    /** Отступы под системные панели: на новых версиях Android окно рисуется под ними. */
    private void applyInsets() {
        webView.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
            @Override
            public WindowInsets onApplyWindowInsets(View v, WindowInsets insets) {
                v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                        insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
                return insets.consumeSystemWindowInsets();
            }
        });
    }

    /** Мост для игры: отправить код работы учителю и распечатать отчёт (в WebView нет window.print). */
    public class Bridge {
        @JavascriptInterface
        public void share(final String title, final String text) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Intent send = new Intent(Intent.ACTION_SEND);
                    send.setType("text/plain");
                    send.putExtra(Intent.EXTRA_SUBJECT, title);
                    send.putExtra(Intent.EXTRA_TEXT, text);
                    startActivity(Intent.createChooser(send, title));
                }
            });
        }

        @JavascriptInterface
        public void print() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
                    if (pm == null) return;
                    String job = getString(R.string.app_name) + ": отчёт";
                    PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(job);
                    pm.print(job, adapter, new PrintAttributes.Builder().build());
                }
            });
        }
    }

    /** Кнопка «Назад»: сначала спрашиваем игру (закрыть окно, вернуться на вкладку, выйти на заставку), и только потом закрываем приложение. */
    @Override
    public void onBackPressed() {
        webView.evaluateJavascript("(function(){return window.__appBack?window.__appBack():false;})()", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String value) {
                if (!"true".equals(value)) {
                    finish();
                }
            }
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onPause() {
        webView.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
