using System;
using System.IO;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web.Script.Serialization;

namespace Dexi {

    using System;
    using System.Runtime.Serialization;

    [Serial
    public partial class AbstractController {

        protected string accountId;
        protected string accessToken;
        protected ApiHelper apiHelper;

        public AbstractController(String accountId, String accessToken) {
            this.accountId = accountId;
            this.accessToken = accessToken;
            this.apiHelper = new ApiHelper(accountId, accessToken);
        }
    }
}
