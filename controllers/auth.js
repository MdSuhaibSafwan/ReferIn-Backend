
const clerkClient = require("@clerk/clerk-sdk-node");


exports.signup = function(req, res, next){
    const redirectUrl = clerkClient.clerkClient.oauth.getAuthorizationUrl({
        strategy: "oauth_linkedin",
        redirectUrl: "http://localhost:3000/auth/linkedin/callback",
    });
    res.status(200).json({"message": "signedin"});
};
