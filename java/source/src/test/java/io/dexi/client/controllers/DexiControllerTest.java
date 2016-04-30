package io.dexi.client.controllers;

import org.junit.Before;
import org.junit.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import io.dexi.client.*;
import io.dexi.client.models.*;
import io.dexi.client.controllers.*;

import static junit.framework.Assert.*;

public class DexiControllerTest {
    private ExecutionsController controller;
    protected Dexi dexi;

    @Before
    public void setupDexi() throws Exception {
        dexi = new Dexi("testAccountId", "testApiKey");
        dexi.setEndpoint("http://localhost:32432");
    }

    protected <T> T getTestValue(String controller, String method, String parameter, Class<T> testValueType) {
        try {
            return testValueType.newInstance();
        } catch (Exception e) {
            return null;
        }
    }

    protected void assertTestResult(String controller, String method, Object result) {

    }

}