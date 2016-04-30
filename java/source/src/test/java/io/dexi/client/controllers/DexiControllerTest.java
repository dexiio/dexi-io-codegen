package io.dexi.client.controllers;

import org.junit.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import io.dexi.client.*;
import io.dexi.client.models.*;
import io.dexi.client.controllers.*;

import static junit.framework.Assert.*;

public class DexiControllerTest {
    protected Dexi dexi;

    @Before
    public void setupDexi() throws Exception {
        dexi = new Dexi("testAccountId", "testApiKey");
        dexi.setEndpoint("http://localhost:32432");
    }

    protected <T> T getTestValue(String controller, String method, String parameter, Class<T> testValueType) {
        if (testValueType == String.class) {
            return (T) "someString";
        }

        if (testValueType == UUID.class) {
            return (T) UUID.randomUUID();
        }

        if (testValueType == Integer.class) {
            return (T) new Integer(123);
        }

        if (testValueType == Long.class) {
            return (T) new Long(123L);
        }

        try {
            return testValueType.newInstance();
        } catch (Exception e) {
            return null;
        }
    }

    protected void assertTestResult(String controller, String method, Object result) {
        assertNotNull(result);
    }

}