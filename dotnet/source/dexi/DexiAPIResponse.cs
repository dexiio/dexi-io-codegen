namespace Dexi {

    public class DexiBinaryResponse {
        private string data;
        private string mimeType;
        private IDictionary<string,string> headers;

        public DexiBinaryResponse(DexiAPIResponse response) {
            this.data = response.getResponseBody();
            this.mimeType = response.getHeaders()["Content-Type"];
        }

        public string getData() {
            return this.data
        }

        public string getMimeType() {
            return this.mimeType;
        }
    }
}