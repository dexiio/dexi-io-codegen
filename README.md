# DexiIO CodeGen
API client source code generator for DexiIO http://dexi.io

## Requirements

### Generator
- Grunt
- npm

### Python module
- Python 2.7
- virtualenv

### Java module
- Java 1.7
- Maven 3.2

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

# Main entry class - this is what the user will instantiate
- class Dexi

  # Create new instance of the Dexi class
  - constructor(String accountId, String apiKey)

  # Set custom endpoint
  - void setEndpoint(String url)

  # Set custom request timeout
  - void setRequestTimeout(int timeout)

  # Set custom user agent
  - void setUserAgent(String userAgent)

  # Get dexi endpoint - defaults to https://api.dexi.io
  - String getEndpoint()

  # Get the request timeout in seconds - defaults to 3600 (1 hour)
  - String getRequestTimeout()

  # Get the user agent - defaults to "Dexi-<language>/<version>
  - String getUserAgent()

  # Calculates the MD5 checksum of (accountId + apiKey) - e.g. MD5(accountId + apiKey)
  - protected String calculateAccessKey(accountId, apiKey);

  # This is an example of a generated controller
  - ExecutionsController executions()  

  # This is an example of a generated controller
  - RunsController runs() 


# Class for all HTTP responses
- class DexiAPIResponse
  
  # the HTTP status code 
  - int getStatusCode()
  
  # A byte array containing the raw response body
  - byte[] getResponseBody()
  
  # A key/value map/object of the response headers
  - Map<String,String> getHeaders();


# General API exception class
- class DexiAPIException

  # The status code of the HTTP response
  - int getStatusCode()
  
  # The raw response body as a string
  - String getResponseBody()
  
  # An error message
  - String getMessage()


# Used for sending the actual HTTP requests
- class DexiAPIHelper

  # Create new instance of DexiAPIHelper
  - constructor(Dexi dexiInstance, String accountId, String accessKey); //Uses the configurations found on the Dexi class for creating the requests
  
  # Send HTTP request to url using httpMethod (can be an enum where applicable) - with optional requestBody
  - APIResponse sendRequest(String url, String httpMethod, String requestBody = null, Map<String,String> requestHeaders = {}) throws DexiAPIException;


# Base class of all the generated controllers
- class DexiAbstractController
  
  #This should be initialized in the constructor:
  - protected DexiAPIHelper api;
  
  # constructor for DexiAbstractController - reimplement as-is in all sub classes
  - constructor(Dexi dexiInstance, String accountId, String accessKey);

  #Takes a url pattern like "/executions/{executionId}" and object: {executionId: "test"} and makes "/executions/test":
  - protected String makeUrl(String urlPattern, Map<String,Object> urlParameters, Map<String,Object> queryParameters);

  #JSON serialization of an object/array
  - protected String serialize(T object); 

  #JSON deserialization of an object
  - protected T deserialize(byte[] json, Class<T> objectType); 


# Base of all generated models  - when applicable
- class DexiBaseModel


# Binary data response  
- class DexiBinaryResponse
  
  # Get the mimetype from the Content-Type header and set the data
  - constructor(DexiAPIResponse response)
  
  # The binary data itself
  - byte[] getData();
  
  # The mime type of the data (Taken from the Content-Type header)
  - String getMimeType();
```

There might be slight differences in async languages (nodejs etc.) which will return promises and non-type-safe languages for serialization / deserialization.

The generated controller methods should be type-safe and do json serialization / deserialization where applicable

**Example of a generated controller (Pseudo-code):**

```

public class ExecutionsController extends DexiAbstractController {
    
    private final Dexi dexiInstance;
    
    private final DexiAPIHelper api;
    
    public ExecutionsController(Dexi dexiInstance, String accountId, String accessKey) {
        this.api = new DexiAPIHelper(dexiInstance, accountId, accessKey);
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





