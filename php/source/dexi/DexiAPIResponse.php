<?php

/**
 * Wrapper for all successful HTTP responses
 */
class DexiAPIResponse  {
    /**
     * @var integer
     */
    private $statusCode;

    /**
     * @var string
     */
    private $responseBody;

    /**
     * @var stdClass
     */
    private $headers;

    /**
     * DexiAPIResponse constructor.
     * @param int $statusCode
     * @param string $responseBody
     * @param stdClass $headers
     */
    public function __construct($statusCode, $responseBody, stdClass $headers) {
        $this->statusCode = $statusCode;
        $this->responseBody = $responseBody;
        $this->headers = $headers;
    }


    /**
     * @return int
     */
    public function getStatusCode() {
        return $this->statusCode;
    }

    /**
     * @param int $statusCode
     */
    public function setStatusCode($statusCode) {
        $this->statusCode = $statusCode;
    }

    /**
     * @return string
     */
    public function getResponseBody() {
        return $this->responseBody;
    }

    /**
     * @param string $responseBody
     */
    public function setResponseBody($responseBody) {
        $this->responseBody = $responseBody;
    }

    /**
     * @return stdClass
     */
    public function getHeaders() {
        return $this->headers;
    }

    /**
     * @param stdClass $headers
     */
    public function setHeaders($headers) {
        $this->headers = $headers;
    }
}