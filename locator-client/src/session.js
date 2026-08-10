var crypto = require('crypto'),
    cookie = require('cookie');

const SESSION_COOKIE = 'locator_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 1 day, in seconds

module.exports = {
  /**
   * Reads the session id from the request's cookie, creating and
   * setting a new one on the response if none is present yet.
   * @param  {http.IncomingMessage} req
   * @param  {http.ServerResponse} resp
   * @return {string}
   */
  getOrCreateSessionId: function(req, resp) {
    var cookies = cookie.parse(req.headers.cookie || '');
    var sessionId = cookies[SESSION_COOKIE];

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      resp.setHeader('Set-Cookie', cookie.serialize(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        maxAge: SESSION_MAX_AGE,
        path: '/'
      }));
    }

    return sessionId;
  }
};
