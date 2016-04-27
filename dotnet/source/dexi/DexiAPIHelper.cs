namespace Dexi {

    class DexiAPIHelper {
        static const HTTP_GET = "GET";
        static const HTTP_POST = "POST";
        static const HTTP_DELETE = "DELETE";
        static const HTTP_PUT = "PUT";

        private string accountId;
        private string accessToken;
        private Dexi dexi;

        public DexiAPIHelper(Dexi dexi, string accountId, string accessToken) {
            this.dexi = dexi;
            this.accountId = accountId;
            this.accessToken = accessToken;
        }

        public DexiAPIResponse SendRequest(string url, string method = "GET", object body = null) {
            var req = System.Net.HttpWebRequest.Create(EndPoint + url) as HttpWebRequest;

            req.Headers.Add("X-CloudScrape-Access", accessKey);
            req.Headers.Add("X-CloudScrape-Account", accountId);
            req.UserAgent = _userAgent;
            req.Timeout = _requestTimeout;
            req.Accept = "application/json";
            req.ContentType = "application/json";
            req.Method = method;

            if (body != null) {
                using (var streamWriter = new StreamWriter(req.GetRequestStream())) {
                    streamWriter.Write(body);
                    streamWriter.Flush();
                }
            }

            DexiAPIResponse objCloudResponse = null;
            HttpWebResponse response = null;
            StreamReader readStream = null;

            try {
                response = (HttpWebResponse)req.GetResponse();

                Stream receiveStream = response.GetResponseStream();
                readStream = new StreamReader(receiveStream, Encoding.UTF8);
                string content = readStream.ReadToEnd();

                return new DexiAPIResponse(response.StatusCode, content, response.Headers);

            } catch (Exception ex) {
                throw ex;
            } finally {
                if (response != null)
                {
                    response.Close();
                }

                if (readStream != null)
                {
                    readStream.Close();
                }
            }
        }
    }
}