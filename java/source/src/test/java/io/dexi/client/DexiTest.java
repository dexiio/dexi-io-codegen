package io.dexi.client;

import org.junit.Test;

import static org.junit.Assert.*;

public class DexiTest {

    @Test
    public void testCalculateAccessKey() {
        Dexi dexi = new Dexi(null, null);
        assertEquals("c8a2084e607b1cb7ca5cf10b8cbfc181", dexi.calculateAccessKey("someAccountId","someApiKey"));
    }
}