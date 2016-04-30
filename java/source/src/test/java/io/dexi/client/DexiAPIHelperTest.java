package io.dexi.client;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.core.util.StringKeyIgnoreCaseMultivaluedMap;
import org.apache.commons.io.input.ReaderInputStream;
import org.junit.Before;
import org.junit.Test;

import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.*;
import static org.mockito.Matchers.*;
import static org.mockito.Mockito.*;

public class DexiAPIHelperTest {

    private DexiAPIHelper api;


    private final String accountId = "accountTest";
    private final String accessKey = "keyTest";
    private final String testUrl = "/test/url";
    private final String testResponseBody = "RESPONSE";
    private final byte[] testRequestBody = "REQUEST".getBytes();
    private int testResponseStatus = 200;
    private MultivaluedMap<String, String> responseHeaders = new StringKeyIgnoreCaseMultivaluedMap<>();

    private WebResource.Builder webResourceBuilder;
    private ClientResponse response;
    private Dexi dexi;

    @Before
    public void setup() {
        String apiKey = "apiKeyTest";
        dexi = new Dexi(accountId, apiKey);
        Client client = mock(Client.class);
        api = new DexiAPIHelper(dexi, client, accountId, accessKey);

        //Mock jersey client:
        WebResource webResource = mock(WebResource.class);
        webResourceBuilder = mock(WebResource.Builder.class);
        when(client.resource(anyString())).thenReturn(webResource);

        when(webResource.type(anyString())).thenReturn(webResourceBuilder);
        when(webResourceBuilder.header(anyString(), anyString())).thenReturn(webResourceBuilder);
        when(webResourceBuilder.accept(anyString())).thenReturn(webResourceBuilder);

        response = mock(ClientResponse.class);

        when(webResourceBuilder.get(ClientResponse.class)).thenReturn(response);
        when(webResourceBuilder.post(eq(ClientResponse.class), any())).thenReturn(response);
        when(webResourceBuilder.put(eq(ClientResponse.class), any())).thenReturn(response);
        when(webResourceBuilder.delete(eq(ClientResponse.class))).thenReturn(response);

        when(response.getStatus()).thenReturn(testResponseStatus);

        when(response.getHeaders()).thenReturn(responseHeaders);

        when(response.getEntityInputStream()).thenReturn(new ReaderInputStream(new StringReader(testResponseBody)));
        when(response.getEntity(String.class)).thenReturn(testResponseBody);
    }

    @Test
    public void can_send_get_request() throws DexiAPIException {
        DexiAPIResponse response = api.sendRequest(testUrl, DexiAPIHelper.HTTPMethod.GET, null, null);

        assertResponse(response);

        verify(webResourceBuilder).get(eq(ClientResponse.class));
    }

    @Test
    public void can_send_post_request_with_body() throws DexiAPIException {
        DexiAPIResponse response = api.sendRequest(testUrl, DexiAPIHelper.HTTPMethod.POST, testRequestBody, null);

        assertResponse(response);

        verify(webResourceBuilder).post(eq(ClientResponse.class), isNotNull());
    }

    @Test
    public void can_send_post_request_with_no_body() throws DexiAPIException {
        DexiAPIResponse response = api.sendRequest(testUrl, DexiAPIHelper.HTTPMethod.POST, null, null);

        assertResponse(response);

        verify(webResourceBuilder).post(eq(ClientResponse.class), isNull());
    }

    @Test
    public void can_send_put_request_with_body() throws DexiAPIException {
        DexiAPIResponse response = api.sendRequest(testUrl, DexiAPIHelper.HTTPMethod.PUT, testRequestBody, null);

        assertResponse(response);

        verify(webResourceBuilder).put(eq(ClientResponse.class), isNotNull());
    }

    @Test
    public void can_send_put_request_with_no_body() throws DexiAPIException {
        DexiAPIResponse response = api.sendRequest(testUrl, DexiAPIHelper.HTTPMethod.PUT, null, null);

        assertResponse(response);

        verify(webResourceBuilder).put(eq(ClientResponse.class), isNull());
    }

    @Test
    public void can_send_delete_request() throws DexiAPIException {
        DexiAPIResponse response = api.sendRequest(testUrl, DexiAPIHelper.HTTPMethod.DELETE, null, null);

        assertResponse(response);

        verify(webResourceBuilder).delete(eq(ClientResponse.class));
    }

    @Test
    public void can_send_additional_headers() throws DexiAPIException {
        Map<String,String> headers = new HashMap<>();
        headers.put("X-Custom-Header", "TEST");
        DexiAPIResponse response = api.sendRequest(testUrl, DexiAPIHelper.HTTPMethod.GET, null, headers);

        assertResponse(response);

        verify(webResourceBuilder).header("X-Custom-Header","TEST");
    }

    @Test
    public void throws_if_response_is_not_ok()  {

        when(response.getStatus()).thenReturn(500);

        Response.StatusType statusInfo = mock(Response.StatusType.class);
        when(statusInfo.getReasonPhrase()).thenReturn("NOT GOOD");

        when(response.getStatusInfo()).thenReturn(statusInfo);

        try {
            api.sendRequest(testUrl, DexiAPIHelper.HTTPMethod.GET, null, null);
            throw new AssertionError("Expected method to throw");
        } catch (DexiAPIException e) {
            assertEquals(testResponseBody, e.getBody());
            assertEquals(500, e.getStatus());
            assertEquals("NOT GOOD", e.getMessage());
        }
    }

    private void assertResponse(DexiAPIResponse response) {
        assertEquals(testResponseStatus, response.getStatusCode());
        assertEquals(testResponseBody, new String(response.getResponseBody()));

        verify(webResourceBuilder).header("X-DexiIO-Account", accountId);
        verify(webResourceBuilder).header("X-DexiIO-Access", accessKey);
        verify(webResourceBuilder).header("User-Agent", dexi.getUserAgent());
    }
}