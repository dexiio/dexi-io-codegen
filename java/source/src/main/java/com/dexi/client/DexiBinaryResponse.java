package com.dexi.client;

public class DexiBinaryResponse  {
    private final byte[] data;
    private final String mimeType;

    public DexiBinaryResponse (DexiAPIResponse response) {
        this.data = response.getResponseBody();
        this.mimeType = response.getHeaders().get("Content-Type");
    }

    public byte[] getData() {
        return data;
    }

    public String getMimeType() {
        return mimeType;
    }
}
