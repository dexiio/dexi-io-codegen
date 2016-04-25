<?php

require_once 'DexiAPIException.php';

class DexiAbstractController {
    public static $BASE_URI = "https://api.dexi.io";
    public static $USER_AGENT = 'dexi.io-php/1.0';
    public static $REQUEST_TIMEOUT = 3600;

    protected $accountId;
    protected $accessToken;

    function __construct($accountId, $accessToken) {
        $this->accountId = accountId;
        $this->accessToken = accessToken;
    }

    /**
     *
     * Make a call to the CloudScrape API
     * @param string $url
     * @param string $method
     * @param mixed $body Will be converted into json
     * @return object
     * @throws DexiAPIException
     */
    public function request($url, $method = 'GET', $body = null) {
        $content = $body ? json_encode($body) : null;
        $headers = array();
        $headers[] = "X-DexiIO-Access: $this->accessKey";
        $headers[] = "X-DexiIO-Account: $this->accountId";
        $headers[] = "User-Agent: " . self::$USER_AGENT;
        $headers[] = "Accept: application/json";
        $headers[] = "Content-Type: application/json";
        if ($content) {
            $headers[] = "Content-Length: " . strlen($content);
        }
        $requestDetails = array(
            'method' => $method,
            'header' => join("\r\n",$headers),
            'content' => $content,
            'timeout' => self::$REQUEST_TIMEOUT
        );
        $context  = stream_context_create(array(
            'https' => $requestDetails,
            'http' => $requestDetails
        ));
        $outRaw = @file_get_contents(self::$BASE_URI . $url, false, $context);
        $out = $this->parseHeaders($http_response_header);
        $out->content = $outRaw;
        if ($out->statusCode < 100 || $out->statusCode > 399) {
            throw new DexiAPIException("dexi.io request failed: $out->statusCode $out->reason", $url, $out);
        }
        return $out;
    }
    /**
     * @param string $url
     * @param string $method
     * @param mixed $body
     * @return mixed
     * @throws DexiAPIException
     */
    public function requestJson($url, $method = 'GET', $body = null) {
        $response = $this->request($url, $method, $body);
        return json_decode($response->content);
    }
    /**
     * @param string $url
     * @param string $method
     * @param mixed $body
     * @return bool
     * @throws DexiAPIException
     */
    public function requestBoolean($url, $method = 'GET', $body = null) {
        $this->request($url, $method, $body);
        return true;
    }

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
            'headers' => $outHeaders
        );
    }
}