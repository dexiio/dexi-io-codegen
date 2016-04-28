package io.dexi.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang.StringUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

public abstract class DexiAbstractController {
    private static Logger log = Logger.getLogger(DexiAbstractController.class.getName());

    protected final String accountId;
    protected final String accessToken;
    protected final DexiAPIHelper api;
    protected final Dexi dexi;
    protected final ObjectMapper objectMapper;

    public DexiAbstractController(Dexi dexi, String accountId, String accessToken) {
        this.dexi = dexi;
        this.accountId = accountId;
        this.accessToken = accessToken;
        this.api = new DexiAPIHelper(dexi, accountId, accessToken);
        this.objectMapper = new ObjectMapper();
    }

    protected String makeUrl(String urlPattern, Map<String,Object> urlParameters, Map<String,Object> queryParameters) {
        String url = urlPattern;
        for(Map.Entry<String,Object> entry: urlParameters.entrySet()) {
            url = url.replace("{" + entry.getKey() + "}", String.valueOf(entry.getValue()));
        }

        List<String> queryParameterList = new ArrayList<>();

        for(Map.Entry<String,Object> entry: queryParameters.entrySet()) {
            queryParameterList.add(entry.getKey() + "=" + String.valueOf(entry.getValue()));
        }

        if (!queryParameterList.isEmpty()) {
            url += "?" + StringUtils.join(queryParameterList, '&');
        }

        return url;
    }

    protected <T> byte[] serialize(T object) {
        try {
            return objectMapper.writeValueAsBytes(object);
        } catch (JsonProcessingException e) {
            log.log(Level.WARNING, "Unable to convert object to JSON", e);
        }

        return null;
    }

    protected <T> T deserialize(byte[] json, Class<T> objectType) {
        try {
            return objectMapper.readValue(json, objectType);
        } catch (IOException e) {
            log.log(Level.WARNING, "Unable to read object from JSON", e);
        }
        return null;
    }
}
