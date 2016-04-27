package io.dexi.client.controllers;

import io.dexi.client.DexiAPIHelper;

public abstract class DexiAbstractController {
    protected final String accountId;
    protected final String accessToken;
    protected final DexiAPIHelper api;
    protected final Dexi dexi;

    public DexiAbstractController(Dexi dexi, String accountId, String accessToken) {
        this.dexi = dexi;
        this.accountId = accountId;
        this.accessToken = accessToken;
        this.api = new DexiAPIHelper(dexi, accountId, accessToken);
    }
}
