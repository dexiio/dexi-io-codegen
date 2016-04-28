package io.dexi.client;

import java.util.Map;

public class DexiAPIResponse  {
    private final int statusCode;
    private final byte[] responseBody;
    private final Map<String,String> headers;

    public DexiAPIResponse(int statusCode, byte[] responseBody, Map<String, String> headers) {
        this.statusCode = statusCode;
        this.responseBody = responseBody;
        this.headers = headers;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public byte[] getResponseBody() {
        return responseBody;
    }

    public Map<String, String> getHeaders() {
        return headers;
    }
}
