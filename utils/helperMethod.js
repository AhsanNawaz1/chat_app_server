const cleanUser = (user) => {
  var userResp = JSON.stringify(user);
  userResp = JSON.parse(userResp);
  delete userResp.password;
  delete userResp.otpSent;

  return userResp
}

module.exports = cleanUser;
