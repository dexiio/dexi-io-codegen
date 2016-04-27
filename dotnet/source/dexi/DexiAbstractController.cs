
namespace Dexi {

    class DexiAbstractController {
    
        protected Dexi dexi;
    
        protected DexiAPIHelper api;

        protected string accountId;
    
        protected string accessToken;
    
        public DexiAbstractController(dexi, accountId, accessToken) {
            this->dexi = dexi;
            this->api = new DexiAPIHelper(dexi, accountId, accessToken);
            this->accountId = accountId;
            this->accessToken = accessToken;
        }
    
        protected string MakeUrl(string urlPattern, IDictionary<string,string> urlParameters, IDictionary<string,string> queryParameters) {
            string url = urlPattern;
    
            foreach(urlParameters as key=>value) {
                url.Replace("{" + key + "}", value);
            }
    
            string[] queryParameterList = new string[];
            foreach(queryParameters as key=>value) {
                queryParameterList[] = rawurlencode(key) + "=" + rawurlencode(value);
            }
    
            if (queryParameterList.size() > 0) {
                url += "?" + queryParameterList.Join("&");
            }
    
            return url;
        }
    
        protected Serialize(object) {
            return json_encode(object);
        }
    
        protected Deserialize(object) {
            return json_decode(object);
        }
    
    }
}