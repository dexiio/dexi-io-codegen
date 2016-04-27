package com.dexi.client;

import com.dexi.client.controllers.*;

public class Dexi {
    private String accountId;

    private String apiKey;

    private String userAgent = "Dexi-Java/1.0";

    private int requestTimeout = 3600;

    private String endpoint = "https://api.dexi.io"

    /**
     * Create new API client instance
     * @param accountId
     * @param apiKey
     */
    public Dexi(String accountId, String apiKey) {
        this.accountId = accountId;
        this.apiKey = apiKey;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public int getRequestTimeout() {
        return requestTimeout;
    }

    public void setRequestTimeout(int requestTimeout) {
        this.requestTimeout = requestTimeout;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    protected String calculateAccessKey(String accountId, String apiKey) {
        String value = accountId + apiKey;

        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] array = md.digest(value.getBytes());
            StringBuffer sb = new StringBuffer();
            for (int i = 0; i < array.length; ++i) {
                sb.append(Integer.toHexString((array[i] & 0xFF) | 0x100).substring(1,3));
            }
            return sb.toString();
        } catch (java.security.NoSuchAlgorithmException e) { }
        return null;
    }

    /**
     * Interact with executions using the API
     *
     * @return ExecutionsController
     */
    public ExecutionsController executions() {
        return new ExecutionsController(this, accountId, this.calculateAccessKey(accountId, apiKey));
    }
    
}