package com.dexi.client.controllers;

import com.dexi.client.ApiHelper;

public abstract class AbstractController {
    protected final String accountId;
    protected final String accessToken;
    protected final ApiHelper apiHelper;

    public AbstractController(String accountId, String accessToken) {
        this.accountId = accountId;
        this.accessToken = accessToken;
        this.apiHelper = new ApiHelper(accountId, accessToken);
    }
}
