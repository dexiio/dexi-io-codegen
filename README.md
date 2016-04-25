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
