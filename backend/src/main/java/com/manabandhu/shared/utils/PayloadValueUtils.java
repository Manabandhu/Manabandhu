package com.manabandhu.shared.utils;

import java.util.Map;

public final class PayloadValueUtils {
    private PayloadValueUtils() {
    }

    public static String getStringOrDefault(Map<String, Object> payload, String key, String defaultValue) {
        if (payload == null || !payload.containsKey(key) || payload.get(key) == null) {
            return defaultValue;
        }
        return payload.get(key).toString();
    }
}
