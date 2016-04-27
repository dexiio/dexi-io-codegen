package com.dexi.client;

public class DexiAPIResponse  {
    private final int statusCode;
    private final String responseBody;
    private final Map<String,String> headers;

    public DexiAPIResponse(int statusCode, String responseBody, Map<String, String> headers) {
        this.statusCode = statusCode;
        this.responseBody = responseBody;
        this.headers = headers;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getResponseBody() {
        return responseBody;
    }

    public Map<String, String> getHeaders() {
        return headers;
    }
}
