package com.dexi.client;

import com.dexi.client.controllers.*;

public class Dexi {
    private String accountId;
    private String apiKey;

    /**
     * Create new API client instance
     * @param accountId
     * @param apiKey
     */
    public Dexi(String accountId, String apiKey) {
        this.accountId = accountId;
        this.apiKey = apiKey;
    }


    /**
     * Interact with executions using the API
     *
     * @return ExecutionsController
     */
    public ExecutionsController executions() {
        return new ExecutionsController(accountId, apiKey);
    }

    /**
     * Interact with runs using the API
     *
     * @return RunsController
     */
    public RunsController runs() {
        return new RunsController(accountId, apiKey);
    }
    
}