
var ExecutionsController = require('./controllers/ExecutionsController');
var RunsController = require('./controllers/RunsController');

function Dexi(accountId, apiKey) {
    this.accountId = accountId;
    this.apiKey = apiKey;
}


/**
 * Interact with executions using the API
 *
 * @return ExecutionsController
 */
Dexi.prototype.executions = function() {
    return new ExecutionsController(this.accountId, this.apiKey);
};

/**
 * Interact with runs using the API
 *
 * @return RunsController
 */
Dexi.prototype.runs = function() {
    return new RunsController(this.accountId, this.apiKey);
};

module.exports = Dexi;