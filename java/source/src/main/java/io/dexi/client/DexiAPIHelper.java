package io.dexi.client;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

public class DexiAPIHelper {
    private static Logger log = Logger.getLogger(DexiAPIHelper.class.getName());

    private final Dexi dexi;

    private final String accountId;

    private final String accessToken;

    private final Client client;

    public DexiAPIHelper(Dexi dexi, String accountId, String accessToken) {
        this.dexi = dexi;
        this.accountId = accountId;
        this.accessToken = accessToken;

        ClientConfig clientConfig = new DefaultClientConfig();
        client = Client.create(clientConfig);
        client.setConnectTimeout(dexi.getRequestTimeout() * 1000);
    }

    protected DexiAPIHelper(Dexi dexi, Client client, String accountId, String accessToken) {
        this.dexi = dexi;
        this.accountId = accountId;
        this.accessToken = accessToken;
        this.client = client;
    }

    private ClientResponse sendGet(String url, Map<String, String> requestHeaders) throws DexiAPIException {
        log.info("Sending GET request to " + url);
        return getWebResource(url, requestHeaders).get(ClientResponse.class);
    }

    private ClientResponse sendPost(String url, Object body, Map<String, String> requestHeaders) throws DexiAPIException {
        log.info("Sending POST request to " + url);
        return getWebResource(url, requestHeaders).post(ClientResponse.class, body);
    }

    private ClientResponse sendPut(String url, Object body, Map<String, String> requestHeaders) throws DexiAPIException {
        log.info("Sending PUT request to " + url);
        return getWebResource(url, requestHeaders).put(ClientResponse.class, body);
    }

    private ClientResponse sendDelete(String url, Map<String, String> requestHeaders) throws DexiAPIException {
        log.info("Sending DELETE request to " + url);
        return getWebResource(url, requestHeaders).delete(ClientResponse.class);
    }

    private WebResource.Builder getWebResource(String url, Map<String, String> requestHeaders) {
        WebResource webResource = client.resource(this.dexi.getEndpoint() + "/" + url);
        WebResource.Builder builder = webResource
                .type("application/json")
                .header("X-DexiIO-Account", accountId)
                .header("X-DexiIO-Access", accessToken)
                .header("User-Agent", this.dexi.getUserAgent())
                .accept("application/json");


        if (requestHeaders != null) {
            for(Map.Entry<String, String> entry: requestHeaders.entrySet()) {
                builder.header(entry.getKey(), entry.getValue());
            }
        }

        return builder;
    }

    public DexiAPIResponse sendRequest(String url, HTTPMethod httpMethod, byte[] requestBody, Map<String,String> requestHeaders) throws DexiAPIException {
        ClientResponse response;

        switch(httpMethod) {
            case GET:
                response = this.sendGet(url, requestHeaders);
                break;
            case POST:
                response = this.sendPost(url, requestBody, requestHeaders);
                break;
            case PUT:
                response = this.sendPut(url, requestBody, requestHeaders);
                break;
            case DELETE:
                response = this.sendDelete(url, requestHeaders);
                break;
            default:
                throw new DexiAPIException("Invalid HTTP method: " + httpMethod);
        }

        if (response.getStatus() < 200 || response.getStatus() > 399) {
            throw new DexiAPIException(response.getStatusInfo().getReasonPhrase(), response.getStatus(),
                    response.getEntity(String.class));
        }

        Map<String,String> headers = new HashMap<>();

        for(Map.Entry<String,List<String>> entry : response.getHeaders().entrySet()) {
            if (entry.getValue().isEmpty()) {
                continue;
            }

            headers.put(entry.getKey(), entry.getValue().get(0));
        }

        try {
            return new DexiAPIResponse(response.getStatus(), IOUtils.toByteArray(response.getEntityInputStream()), headers);
        } catch (IOException e) {
            throw new DexiAPIException("Failed to read response", e);
        }
    }

    public enum HTTPMethod {
        GET,POST,PUT,DELETE
    }
}
