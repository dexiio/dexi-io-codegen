namespace Dexi {

    public class DexiAPIResponse {
        private int statusCode;
        private string responseBody;
        private IDictionary<string,string> headers;

        public DexiAPIResponse(int status, string body, IDictionary<string,string> headers) {
            this.statusCode = status;
            this.responseBody = body;
            this.headers = headers;
        }

        public int getStatusCode() {
            return this.statusCode;
        }

        public string getResponseBody() {
            return this.responseBody;
        }

        public IDictionary<string,string> getHeaders() {
            return this.headers;
        }
    }
}