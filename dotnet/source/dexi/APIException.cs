namespace Dexi {

    public class APIException extends Exception {
        private int status;
        private String body;

        public APIException(String message, int status, String body) {
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

        public String getBody() {
            return body;
        }

        public void setBody(String body) {
            this.body = body;
        }
    }
}