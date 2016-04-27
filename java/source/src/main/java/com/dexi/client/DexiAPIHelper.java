package com.dexi.client;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.api.json.JSONConfiguration;

import java.util.Map;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DexiAPIHelper {
    private static Logger log = Logger.getLogger(ApiHelper.class.getName());

    private final Dexi dexi;

    private final String accountId;

    private final String accessToken;

    private Client client;

    public DexiAPIHelper(Dexi dexi, String accountId, String accessToken) {
        this.dexi = dexi;
        this.accountId = accountId;
        this.accessToken = accessToken;

        ClientConfig clientConfig = new DefaultClientConfig();
        clientConfig.getFeatures().put(JSONConfiguration.FEATURE_POJO_MAPPING, Boolean.TRUE);
        client = Client.create(clientConfig);
        client.setConnectTimeout(dexi.getRequestTimeout() * 1000);
    }

    private ClientResponse sendGet(String url) throws APIException {
        log.info("Sending GET request to " + url);
        return getWebResource(url).get(ClientResponse.class);
    }

    private ClientResponse sendPost(String url, Object body) throws APIException {
        log.info("Sending POST request to " + url);
        return getWebResource(url).post(ClientResponse.class, body);
    }

    private ClientResponse sendPut(String url, Object body) throws APIException {
        log.info("Sending PUT request to " + url);
        return getWebResource(url).put(ClientResponse.class, body);
    }

    private ClientResponse sendDelete(String url) throws APIException {
        log.info("Sending DELETE request to " + url);
        return getWebResource(url).delete(ClientResponse.class);
    }

    private WebResource.Builder getWebResource(String url) {
        WebResource webResource = client.resource(this.dexi.getEndpoint() + "/" + url);
        return webResource
                .header("X-DexiIO-Account", accountId)
                .header("X-DexiIO-Access", accessToken)
                .header("User-Agent", this.dexi.getUserAgent())
                .accept("application/json")
                .type("application/json");
    }

    public DexiAPIResponse sendRequest(String url, HTTPMethod httpMethod, byte[] requestBody, Map<String,String> requestHeaders = null) {
        WebResource resource = getWebResource(url);
        ClientResponse response = null;

        switch(httpMethod) {
            case GET:
                response = this.sendGet(url);
                break;
            case POST:
                response = this.sendPost(url, requestBody);
                break;
            case PUT:
                response = this.sendPut(url, requestBody);
                break;
            case DELETE:
                response = this.sendDelete(url);
                break;
            default:
                throw new DexiAPIException("Invalid HTTP method: " + httpMethod);
        }

        if (response.getStatus() < 200 || response.getStatus() > 206) {
            throw new DexiAPIException(response.getStatusInfo().getReasonPhrase(), response.getStatus(),
                    response.getEntity(String.class));
        }

        return new DexiAPIResponse(response.getStatus(), response.getEntity(Object.class), response.getHeaders());
    }

    public String makeUrl(String url, Map<String, Object> pathParams, , Map<String, Object> queryParams) {
        StringBuilder sb = new StringBuilder(url);
        for (Map.Entry<String, Object> entry : pathParams.entrySet()) {
            Pattern p = Pattern.compile("\\{" + entry.getKey() + "\\}");
            Matcher m = p.matcher(sb);
            while (m.find()) {
                sb.replace(m.start(), m.end(), String.valueOf(entry.getValue()));
                m.reset();
            }
        }
        return sb.toString();
    }
}
