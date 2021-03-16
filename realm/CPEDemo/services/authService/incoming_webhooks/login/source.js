// This function is the webhook's request handler.
exports = async function(payload, response) {
  /*===============================================================
  - Date:       Author:           Version:        Notes:
  -----------------------------------------------------------------
  - 2021-02-22  Roy Kiesler       1.0            Initial Release
  -
  ===============================================================*/

    const jwt = require("jsonwebtoken");

    // Raw request body (if the client sent one).
    // Example: {"email":"nero@admin.com","password":"admin123"}
    const body = payload.body;
    console.log("Request body:", body);

    const loginRequest = EJSON.parse(payload.body.text());
    if (loginRequest && loginRequest.email && loginRequest.password) {
        // get handle into database
        var conn = context.services.get("mongodb-atlas").db("CPE").collection("users");
        
        // search for user
        var userDetail = await conn.findOne({ "user.email": loginRequest.email, "password": loginRequest.password });
        if (userDetail) {
          var token = jwt.sign({"user": userDetail.user}, 'shhhhh');
          return {"auth_token": token, "user": userDetail.user};
        } else {
          // unauthorized
          response.setStatusCode(401);
        }
    }
};