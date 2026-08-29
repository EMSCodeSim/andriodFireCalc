package com.fireopscalc.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @SuppressWarnings("deprecation")
    private void performDefaultBack() {
        super.onBackPressed();
    }

    /**
     * Give the legacy calculator UI first chance to close an open sheet/modal or
     * return from Scenarios/Info to Pump. If the UI does not consume Back, fall
     * through to Android's normal behavior so Back exits from the main Pump view.
     */
    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (getBridge() == null || getBridge().getWebView() == null) {
            performDefaultBack();
            return;
        }

        getBridge().getWebView().evaluateJavascript(
            "(function(){try{return !!(window.fireopsHandleAndroidBack && window.fireopsHandleAndroidBack());}catch(e){return false;}})();",
            value -> {
                if (!"true".equals(value)) {
                    performDefaultBack();
                }
            }
        );
    }
}
