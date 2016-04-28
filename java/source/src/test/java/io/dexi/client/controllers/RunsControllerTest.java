package io.dexi.client.controllers;

import io.dexi.client.DexiAPIException;
import io.dexi.client.models.*;
import io.dexi.client.Dexi;
import org.junit.Before;
import org.junit.Test;

import java.util.Arrays;
import java.util.Random;
import java.util.UUID;

import static junit.framework.Assert.*;
import static junit.framework.TestCase.assertTrue;
import static junit.framework.TestCase.fail;

public class RunsControllerTest {
    private RunsController runsController;
    private ExecutionsController executionsController;
    private UUID runId;

    @Before
    public void setUp() throws Exception {
        String accountId = System.getenv("DEXI_TEST_ACCOUNT_ID");
        String accessToken = System.getenv("DEXI_TEST_ACCESS_TOKEN");
        runsController = new Dexi(accountId, accessToken).runs();
        runId = UUID.fromString(System.getenv("DEXI_TEST_RUN_ID"));
        executionsController = new Dexi(accountId, accessToken).executions();
    }

    @Test
    public void runsGet() throws DexiAPIException {
        Run run = runsController.get(runId);

        assertEquals(runId, run.getId());
        assertEquals("Default", run.getName());
    }

    @Test
    public void runsExecuteWithInput() throws DexiAPIException, InterruptedException {
        final RunInputs body = new RunInputs();
        final String email = String.format("test%s@dexi.io", new Random().nextInt());
        body.put("email", email);
        Execution execution = runsController.executeWithInput(body, runId, false);

        assertNotNull(execution.getId());
        assertTrue(Arrays.asList(State.QUEUED, State.RUNNING).contains(execution.getState()));
        assertNotNull(execution.getStarts());
        assertNull(execution.getFinished());

        Result result = getAsyncResult(execution);
        ExecutionsControllerTest.validateTestExecutionResult(email, result);
    }

    private Result getAsyncResult(Execution execution) throws InterruptedException, DexiAPIException {
        while (execution.getState() != State.OK) {
            if (execution.getState() == State.FAILED) {
                fail("Execution failed");
            }
            Thread.sleep(1000);
            execution = executionsController.get(execution.getId());
        }
        return executionsController.getResult(execution.getId(), "json");
    }

}
