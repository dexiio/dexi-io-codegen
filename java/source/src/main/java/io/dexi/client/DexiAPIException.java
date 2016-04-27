package io.dexi.client;

public class DexiAPIException extends Exception {
    private int status;
    private String body;

    public DexiAPIException(String message, int status, String body) {
        super(message);
        this.status = status;
        this.body = body;
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
