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

public class ApiHelper {
    private static Logger log = Logger.getLogger(ApiHelper.class.getName());

    private Client client;
    private final String accountId;
    private final String accessToken;

    public ApiHelper(String accountId, String accessToken) {
        this.accountId = accountId;
        this.accessToken = accessToken;

        ClientConfig clientConfig = new DefaultClientConfig();
        clientConfig.getFeatures().put(JSONConfiguration.FEATURE_POJO_MAPPING, Boolean.TRUE);
        client = Client.create(clientConfig);
        client.setConnectTimeout(Configuration.CONNECTION_TIMEOUT * 1000);
    }

    public ClientResponse get(String url) throws APIException {
        log.info("Sending GET request to " + url);
        final ClientResponse response = getWebResource(url).get(ClientResponse.class);
        log.info("Got response. Status:" + response.getStatus() + ". Headers:" + response.getHeaders());
        if (response.getStatus() < 200 || response.getStatus() > 206) {
            throw new APIException(response.getStatusInfo().getReasonPhrase(), response.getStatus(),
                    response.getEntity(String.class));
        }
        return response;
    }

    public ClientResponse post(String url, Object body) throws APIException {
        log.info("Sending POST request to " + url);
        final ClientResponse response = getWebResource(url).post(ClientResponse.class, body);
        log.info("Got response. Status:" + response.getStatus() + ". Headers:" + response.getHeaders());
        if (response.getStatus() < 200 || response.getStatus() > 206) {
            throw new APIException(response.getStatusInfo().getReasonPhrase(), response.getStatus(),
                    response.getEntity(String.class));
        }
        return response;
    }

    public ClientResponse put(String url, Object body) throws APIException {
        log.info("Sending PUT request to " + url);
        final ClientResponse response = getWebResource(url).put(ClientResponse.class, body);
        log.info("Got response. Status:" + response.getStatus() + ". Headers:" + response.getHeaders());
        if (response.getStatus() < 200 || response.getStatus() > 206) {
            throw new APIException(response.getStatusInfo().getReasonPhrase(), response.getStatus(),
                    response.getEntity(String.class));
        }
        return response;
    }

    public ClientResponse delete(String url) throws APIException {
        log.info("Sending DELETE request to " + url);
        final ClientResponse response = getWebResource(url).delete(ClientResponse.class);
        log.info("Got response. Status:" + response.getStatus() + ". Headers:" + response.getHeaders());
        if (response.getStatus() < 200 || response.getStatus() > 206) {
            throw new APIException(response.getStatusInfo().getReasonPhrase(), response.getStatus(),
                    response.getEntity(String.class));
        }
        return response;
    }

    private WebResource.Builder getWebResource(String url) {
        WebResource webResource = client.resource(Configuration.BASE_URI + url);
        return webResource
                .header("X-DexiIO-Account", accountId)
                .header("X-DexiIO-Access", accessToken)
                .header("user-agent", "DexiIO CodeGen Java 1.0")
                .accept("application/json").type("application/json");
    }

    public String processParameters(String url, Map<String, Object> params) {
        StringBuilder sb = new StringBuilder(url);
        for (Map.Entry<String, Object> entry : params.entrySet()) {
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
