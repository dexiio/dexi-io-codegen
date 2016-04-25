namespace Dexi {

    public class Dexi {
        private String accountId;
        private String apiKey;

        public Dexi(String accountId, String apiKey) {
            this.accountId = accountId;
            this.apiKey = apiKey;
        }

        public ExecutionsController executions() {
            return new ExecutionsController(accountId, apiKey);
        }

        public RunsController runs() {
            return new RunsController(accountId, apiKey);
        }

    }
}