namespace Dexi {

    class ApiHelper {
        private string accountId;
        private string accessToken;

        public ApiHelper(string accountId, string accessToken) {
            this.accountId = accountId;
            this.accessToken = accessToken;
        }

        public ClientResponse Get(string url) throws APIException {

            return this.Request(url, "GET");
        }

        public ClientResponse Post(string url, object body) throws APIException {
            return this.Request(url, "POST", body);
        }

        public ClientResponse put(string url, object body) throws APIException {
            return this.Request(url, "PUT", body);
        }

        public ClientResponse delete(string url) throws APIException {
            return this.Request(url, "DELETE");
        }

        public string processParameters(string url, IDictionary<string, object> parameters) {

        }

        public CloudResponse Request(string url, string method = "GET", object body = null) {
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

            CloudResponse objCloudResponse = null;
            HttpWebResponse response = null;
            StreamReader readStream = null;

            try {

                response = (HttpWebResponse)req.GetResponse();

                objCloudResponse = new CloudResponse();

                objCloudResponse.statusCode = response.StatusCode;
                objCloudResponse.Headers = response.Headers;
                objCloudResponse.StatusDescription = response.StatusDescription;

                WebHeaderCollection obj = response.Headers;
                Stream receiveStream = response.GetResponseStream();
                readStream = new StreamReader(receiveStream, Encoding.UTF8);
                objCloudResponse.Content = readStream.ReadToEnd();

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

            return objCloudResponse;
        }

        /// <summary>
        /// MD5 Encryption
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        private string CreateMD5(string input) {
            // Use input string to calculate MD5 hash
            MD5 md5 = System.Security.Cryptography.MD5.Create();
            byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
            byte[] hashBytes = md5.ComputeHash(inputBytes);

            // Convert the byte array to hexadecimal string
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hashBytes.Length; i++)
            {
                sb.Append(hashBytes[i].ToString("X2"));
            }
            return sb.ToString();
        }
    }
}