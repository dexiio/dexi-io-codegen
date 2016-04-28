package io.dexi.client;

import jdk.internal.jfr.events.ThrowablesEvent;

public class DexiAPIException extends Exception {
    private int status;
    private String body;

    public DexiAPIException(String message, int status, String body) {
        super(message);
        this.status = status;
        this.body = body;
    }

    public DexiAPIException(String message, Throwable cause) {
        super(message, cause);
    }

    public DexiAPIException(String message) {
        super(message);
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
}
