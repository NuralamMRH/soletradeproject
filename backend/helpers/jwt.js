const expressJwt = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/appcontents(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/blogs(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/brands(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/users(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/attributes(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/attribute-options(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/bidding(.*)/, methods: ["GET", "OPTIONS", "POST"] },
      { url: /\/api\/v1\/selling(.*)/, methods: ["GET", "OPTIONS", "POST"] },
      { url: /\/api\/v1\/shipping(.*)/, methods: ["GET", "OPTIONS", "POST"] },

      { url: /\/api\/v1\/portfolio(.*)/, methods: ["GET", "OPTIONS", "POST"] },
      { url: /\/api\/v1\/draw-joins(.*)/, methods: ["GET", "OPTIONS", "POST"] },

      { url: /\/api\/v1\/draws(.*)/, methods: ["GET", "OPTIONS", "POST"] },
      {
        url: /\/api\/v1\/user-calender-notifications(.*)/,
        methods: ["GET", "OPTIONS", "POST"],
      },

      {
        url: /\/api\/v1\/solecheckitems(.*)/,
        methods: ["GET", "OPTIONS", "POST"],
      },
      {
        url: /\/api\/v1\/solecheckbrand(.*)/,
        methods: ["GET", "OPTIONS", "POST"],
      },
      {
        url: /\/api\/v1\/solecheckmodel(.*)/,
        methods: ["GET", "OPTIONS", "POST"],
      },
      `${api}/users/login`,
      `${api}/users/register`,
      `${api}/orders`,
      `${api}/expoPushTokens`,
    ],
  });
}

async function isRevoked(req, payload, done) {
  try {
    // Check if the user should be revoked based on some condition
    // if (!payload.isAdmin) {
    //   // User is not admin, revoke the token
    //   return done(null, true);
    // }

    // User is authorized, don't revoke the token
    return done(null, false);
  } catch (error) {
    // If an error occurs, consider it as token revocation and revoke the token
    return done(error, true);
  }
}

module.exports = authJwt;
