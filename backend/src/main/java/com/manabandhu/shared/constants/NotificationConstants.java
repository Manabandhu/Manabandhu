package com.manabandhu.shared.constants;

public final class NotificationConstants {
    private NotificationConstants() {
    }

    public static final String DATA_TYPE_KEY = "type";
    public static final String DATA_EVENT_ID_KEY = "eventId";

    public static final String PAYLOAD_REQUESTED_BY = "requestedBy";
    public static final String PAYLOAD_STATUS = "status";
    public static final String PAYLOAD_MATCHES_COUNT = "matchesCount";

    public static final String TITLE_RIDE_REQUESTED = "New Ride Request";
    public static final String TITLE_USCIS_STATUS_CHANGE = "USCIS Status Update";
    public static final String TITLE_LISTING_HIDDEN = "Listing Hidden";
    public static final String TITLE_PRICE_ALERT_MATCHED = "Price Alert Matched";

    public static final String DEFAULT_REQUESTED_BY = "Someone";
    public static final String DEFAULT_STATUS = "updated";
    public static final String DEFAULT_MATCHES_COUNT = "new";

    public static final String LISTING_HIDDEN_BODY =
            "Your listing has been hidden due to inactivity. Update it to make it visible again.";
    public static final String USCIS_STATUS_CHANGE_BODY_PREFIX =
            "Your USCIS case status has changed to: ";
    public static final String RIDE_REQUESTED_BODY_SUFFIX = " requested to join your ride";
    public static final String PRICE_ALERT_BODY_PREFIX = "Found ";
    public static final String PRICE_ALERT_BODY_SUFFIX = " listing(s) matching your price alert criteria!";
}
