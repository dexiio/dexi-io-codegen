package io.dexi.client.controllers;

import io.dexi.client.DexiAPIException;
import io.dexi.client.models.Execution;
import io.dexi.client.models.Result;
import io.dexi.client.models.State;
import io.dexi.client.Dexi;
import org.junit.Before;
import org.junit.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static junit.framework.Assert.assertNotNull;
import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertTrue;

public class ExecutionsControllerTest {
    private ExecutionsController executionsController;
    private UUID executionId;
    private String fileId;

    @Before
    public void setUp() throws Exception {
        String accountId = System.getenv("DEXI_TEST_ACCOUNT_ID");
        String accessToken = System.getenv("DEXI_TEST_ACCESS_TOKEN");
        executionsController = new Dexi(accountId, accessToken).executions();
        executionId = UUID.fromString(System.getenv("DEXI_TEST_EXECUTION_ID"));
        fileId = System.getenv("DEXI_TEST_FILE_ID");
    }

    @Test
    public void executionsGet() throws DexiAPIException {
        Execution execution = executionsController.get(executionId);

        assertNotNull(execution.getStarts());
        assertNotNull(execution.getFinished());
        assertEquals(executionId, execution.getId());
        assertEquals(State.OK, execution.getState());
    }

    @Test
    public void executionsGetResultFile() throws DexiAPIException {
        byte[] content = executionsController.getResultFile(executionId, fileId);

        assertTrue(new String(content).contains("PNG"));
    }

    @Test
    public void executionsGetThrowsExceptionIfNotFound() {
        try {
            executionsController.get(UUID.randomUUID());
        } catch (DexiAPIException e) {
            assertEquals("Not Found", e.getMessage());
            assertEquals(404, e.getStatus());
            assertEquals("{\"error\":true,\"code\":404}", e.getBody());
        }
    }

    protected static void validateTestExecutionResult(String email, Result result) {
        Map<String, Integer> headerIndexMap = new HashMap<>();
        for (int i = 0; i < result.getHeaders().size(); i++) {
            String header = result.getHeaders().get(i);
            headerIndexMap.put(header, i);
        }

        assertEquals(1, result.getRows().size());
        final List<String> row = result.getRows().get(0);
        assertEquals(email, row.get(headerIndexMap.get("email")));
        assertEquals(email, row.get(headerIndexMap.get("email_output")));
        assertEquals("dexi.io", row.get(headerIndexMap.get("contact_header")));
        assertTrue(row.get(headerIndexMap.get("contact_body")).contains("Norre Voldgade 24"));
        assertTrue(row.get(headerIndexMap.get("logo")).contains("FILE"));
    }

}
