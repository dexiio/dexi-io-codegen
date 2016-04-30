package io.dexi.client;

import org.junit.Before;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.*;

public class DexiAbstractControllerTest {

    private TestController controller;

    @Before
    public void setup() {
        controller = new TestController(new Dexi("test","test"),"test","test");
    }

    @Test
    public void test_makeUrl() throws Exception {
        Map<String,Object> pathParams = new HashMap<>();
        Map<String,Object> queryParams = new HashMap<>();

        pathParams.put("test","first");
        pathParams.put("variables","other");

        queryParams.put("name1","value1");
        queryParams.put("name2","value2");

        String url = controller.makeUrl("/{test}/more/{variables}", pathParams, queryParams);

        assertEquals("/first/more/other?name1=value1&name2=value2", url);
    }

    @Test
    public void test_serialize() throws Exception {
        byte[] tests = controller.serialize(new TestBean("test", 1));

        assertEquals("{\"name\":\"test\",\"value\":1}", new String(tests));
    }

    @Test
    public void test_deserialize() throws Exception {

        TestBean bean = controller.deserialize("{\"name\":\"test\",\"value\":1}".getBytes(), TestBean.class);

        assertEquals(new TestBean("test", 1), bean);
    }

    private class TestController extends DexiAbstractController {

        public TestController(Dexi dexi, String accountId, String accessToken) {
            super(dexi, accountId, accessToken);
        }
    }

    public static class TestBean {
        private String name;
        private int value;

        public TestBean() {
        }

        public TestBean(String name, int value) {
            this.name = name;
            this.value = value;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getValue() {
            return value;
        }

        public void setValue(int value) {
            this.value = value;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;

            TestBean testBean = (TestBean) o;

            if (value != testBean.value) return false;
            return name != null ? name.equals(testBean.name) : testBean.name == null;

        }

        @Override
        public int hashCode() {
            int result = name != null ? name.hashCode() : 0;
            result = 31 * result + value;
            return result;
        }
    }
}