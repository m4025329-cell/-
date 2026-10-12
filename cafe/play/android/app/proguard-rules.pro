# Правила для R8. Игра запускается внутри WebView. Мост для печати и отправки файла вызывается из JavaScript.
-keepclassmembers class ru.pervyistolik.game.MainActivity$Bridge {
    @android.webkit.JavascriptInterface <methods>;
}
