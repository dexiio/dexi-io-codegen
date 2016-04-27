<?php

require_once './DexiAPIException.php';
require_once './DexiAPIHelper.php';

class DexiAbstractController {

    /**
     * @var Dexi
     */
    protected $dexi;

    /**
     * @var DexiAPIHelper
     */
    protected $api;

    /**
     * @var string
     */
    protected $accountId;

    /**
     * @var string
     */
    protected $accessToken;

    /**
     * DexiAbstractController constructor.
     * @param Dexi $dexi
     * @param string $accountId
     * @param string $accessToken
     */
    public function __construct($dexi, $accountId, $accessToken) {
        $this->dexi = $dexi;
        $this->api = new DexiAPIHelper($dexi, $accountId, $accessToken);
        $this->accountId = $accountId;
        $this->accessToken = $accessToken;
    }

    protected function makeUrl($urlPattern, $urlParameters, $queryParameters) {
        $url = $urlPattern;

        foreach($urlParameters as $key=>$value) {
            $url = str_replace('{' . $key . '}', $value, $url);
        }

        $queryParameterList = array();
        foreach($queryParameters as $key=>$value) {
            $queryParameterList[] = rawurlencode($key) . '=' . rawurlencode($value);
        }

        if (count($queryParameterList) > 0) {
            $url .= '?' . join('&', $queryParameterList);
        }

        return $url;
    }

    protected function serialize($object) {
        return json_encode($object);
    }

    protected function deserialize($object) {
        return json_decode($object);
    }

}