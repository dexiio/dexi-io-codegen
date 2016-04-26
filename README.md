# DexiIO CodeGen
API client source code generator for DexiIO http://dexi.io

## Requirements

### Generator
* Grunt
* npm

### Python module
* Python 2.7
* virtualenv

### Java module
* Java 1.7
* Maven 3.2

## Usage
Default task generates all clients and run tests:  
```
grunt
```  

You can also generate sources for a particular client:  
```
grunt generate:python
```

Or run tests for it:  
```
grunt test:python
```

Please note that you need to have the following environment variables set in order to run tests:  
DEXI_TEST_ACCOUNT_ID  
DEXI_TEST_ACCESS_TOKEN  
DEXI_TEST_RUN_ID  
DEXI_TEST_EXECUTION_ID  
DEXI_TEST_FILE_ID  


## Pseudo-Code specs
Every SDK client implementation has the following base structure:
```
* class Dexi (Main class for the API)
** constructor(String accountId, String apiKey)
** void setEndpoint(String url)
** void setRequestTimeout(int timeout)
** void setUserAgent(String userAgent)
** String getEndpoint()
** String getRequestTimeout()
** String getUserAgent()
** protected String calculateAccessKey(accountId, apiKey); //MD5(accountId + apiKey)
** ControllerClass1 controllerName1() //These are the generated controllers 
** ControllerClass2 controllerName2() //These are the generated controllers

* class DexiAPIResponse
** int getStatusCode()
** String getStatusReason()
** String getResponseBody()
** Map<String,String> getHeaders();

* class DexiAPIException
** int getStatusCode()
** byte[] getResponseBody()
** String getMessage()

* class DexiApiHelper //Do the actual HTTP requests
** constructor(Dexi dexiInstance, String accountId, String accessKey); //Uses the configurations found on the Dexi class for creating the requests
** APIResponse sendPost(String url, String requestBody = null) throws DexiAPIException;
** APIResponse sendPut(String url, String requestBody = null) throws DexiAPIException;
** APIResponse sendGet(String url) throws DexiAPIException;
** APIResponse sendDelete(String url) throws DexiAPIException;

* class DexiAbstractController //Base class of all the generated controllers
** protected ApiHelper api; //This should be initialized in the constructor
** constructor(Dexi dexiInstance, String accountId, String accessKey);
** protected String makeUrl(String urlPattern, Map<String,Object> urlParameters, Map<String,Object> queryParameters); //Takes a url pattern like "/executions/{executionId}" and object: {executionId: "test"} and makes "/executions/test"
** protected String serialize(T object); //JSON serialization of an object/array
** protected T deserialize(byte[] json, Class<T> objectType); //JSON deserialization of an object

* class DexiBaseModel //Base of all generated models - when applicable

* class DexiBinaryResponse //Used when getting binary data
** constructor(DexiAPIResponse response) //Get the mimetype from the Content-Type header and set the data
** byte[] getData();
** String getMimeType();
```

There might be slight differences in async languages (nodejs etc.) which will return promises and non-type-safe languages for serialization / deserialization.

The generated controller methods should be type-safe and do json serialization / deserialization where applicable

**Example of a generated controller (Pseudo-code):** 

```

public class ExecutionsController extends DexiAbstractController {
    
    private final Dexi dexiInstance;
    
    private final DexiApiHelper api;
    
    public ExecutionsController(Dexi dexiInstance, String accountId, String accessKey) {
        this.api = new ApiHelper(dexiInstance, accountId, accessKey);
        this.dexiInstance = dexiInstance;
    }
    
    public ExecutionDTO getExecution(String executionId) throws DexiAPIException {
        String url = this.makeUrl("executions/{executionId}", {executionId: "test"}, {format:"json"});
        DexiAPIResponse response = this.api.sendGet(url);
        return this.deserialize(response.getResponseBody(), ExecutionDTO.class);
    }
    
    
    public DexiBinaryResponse getBinaryFile(String executionId) throws DexiAPIException {
        String url = this.makeUrl("executions/{executionId}/file", {executionId: "test"}, {format:"json"});
        DexiAPIResponse response = this.api.sendGet(url);
        return new DexiBinaryResponse(response);
    }
}
```





