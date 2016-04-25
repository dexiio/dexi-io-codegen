<?php

require_once 'controllers/ExecutionsController.php';
require_once 'controllers/RunsController.php';

class Dexi {
    private $accountId;
    private $apiKey;

    /**
     * Create new API client instance
     * @param $accountId
     * @param $apiKey
     */
    public function __construct($accountId, $apiKey) {
        $this->accountId = $accountId;
        $this->apiKey = $apiKey;
    }


    /**
     * Interact with executions using the API
     *
     * @return ExecutionsController
     */
    public function executions() {
        return new ExecutionsController($this->accountId, $this->apiKey);
    }

    /**
     * Interact with runs using the API
     *
     * @return RunsController
     */
    public function runs() {
        return new RunsController($this->accountId, $this->apiKey);
    }
}