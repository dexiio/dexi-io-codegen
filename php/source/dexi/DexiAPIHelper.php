<?php

require_once './DexiAPIResponse.php';
require_once './DexiAPIException.php';

/**
 * Handles all HTTP requests to Dexi
 */
class DexiAPIHelper {
    const HTTP_GET  = "GET";
    const HTTP_POST = "POST";
    const HTTP_PUT = "PUT";
    const HTTP_DELETE = "DELETE";

    /**
     * @var Dexi
     */
    private $dexi;

    /**
     * @var string
     */
    private $accountId;

    /**
     * @var string
     */
    private $accessKey;


    /**
     * DexiAPIHelper constructor.
     * @param $dexi Dexi
     * @param $accountId string
     * @param $accessKey string
     */
    public function __construct($dexi, $accountId, $accessKey) {
        $this->dexi = $dexi;
        $this->accountId = $accountId;
        $this->accessKey = $accessKey;
    }

    /**
     * Send HTTP request to url - with optional requestBody
     *
     * @param string $url
     * @param string $httpMethod See class constants HTTP_*
     * @param string $requestBody
     * @param array $requestHeaders additional request headers
     * @return DexiAPIResponse
     * @throws DexiAPIException
     */
    public function sendRequest($url, $httpMethod, $requestBody = null, $requestHeaders = array()) {

        $headers = array();
        $headers[] = "X-DexiIO-Access: $this->accessKey";
        $headers[] = "X-DexiIO-Account: $this->accountId";
        $headers[] = "User-Agent: " . $this->dexi->getUserAgent();

        if (!$requestHeaders['Accept']) {
            $headers[] = "Accept: application/json";
        }

        if (!$requestHeaders['Content-Type']) {
            $headers[] = "Content-Type: application/json";
        }

        if ($requestBody && !$requestHeaders['Content-Length']) {
            $headers[] = "Content-Length: " . strlen($requestBody);
        }

        foreach($requestHeaders as $key => $value) {
            $headers[] = $key.': ' . $value;
        }

        $requestDetails = array(
            'method' => $httpMethod,
            'header' => join("\r\n",$headers),
            'content' => $requestBody,
            'timeout' => $this->dexi->getRequestTimeout()
        );

        $context  = stream_context_create(array(
            'https' => $requestDetails,
            'http' => $requestDetails
        ));

        $outRaw = @file_get_contents($this->dexi->getEndpoint() . '/' . $url, false, $context);

        $out = $this->parseHeaders($http_response_header);

        if ($out->statusCode < 100 || $out->statusCode > 399) {
            throw new DexiAPIException("dexi.io request failed: $out->statusCode $out->reason", $url, $out);
        }

        return new DexiAPIResponse($out->statusCode, $outRaw, $out->headers);
    }

    /**
     * Internal function for parsing http result
     *
     * @param $http_response_header
     * @return object
     */
    private function parseHeaders($http_response_header) {
        $status = 0;
        $reason = '';
        $outHeaders = array();
        if ($http_response_header &&
            count($http_response_header) > 0) {
            $httpHeader = array_shift($http_response_header);
            if (preg_match('/([0-9]{3})\s+([A-Z_]+)/i', $httpHeader, $matches)) {
                $status = intval($matches[1]);
                $reason = $matches[2];
            }
            foreach($http_response_header as $header) {
                $parts = explode(':',$header,2);
                if (count($parts) < 2) {
                    continue;
                }
                $outHeaders[trim($parts[0])] = $parts[1];
            }
        }
        return (object)array(
            'statusCode' => $status,
            'reason' => $reason,
            'headers' => (object)$outHeaders
        );
    }

}