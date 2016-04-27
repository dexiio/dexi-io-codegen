<?php

class DexiBinaryResponse {
    private $data;
    private $mimeType;
    /**
     * @param DexiAPIResponse $response
     */
    function __construct($response) {
        $this->data = $response->getResponseBody();
        $this->mimeType = $response->getHeaders()['Content-Type'];
    }

    /**
     * The binary data
     *
     * @return string
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Get the mime type of the binary content
     *
     * @return string
     */
    public function getMimeType()
    {
        return $this->mimeType;
    }


}