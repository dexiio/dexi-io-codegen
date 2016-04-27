namespace Dexi {

    public class DexiAPIException : Exception {
        private int status;
        private string body;

        public APIException(string message, int status, string body) {
            super(message);
            this.status = status;
            this.body = body;
        }

        public int getStatus() {
            return status;
        }

        public void setStatus(int status) {
            this.status = status;
        }

        public string getBody() {
            return body;
        }

        public void setBody(string body) {
            this.body = body;
        }
    }
}