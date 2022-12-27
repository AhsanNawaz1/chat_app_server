const router = require("express").Router();
const userRoute = require("./user");
const chat = require("./chat");



const defaultRoutes = [
  {
    path: "/users",
    route: userRoute
  },
  {
    path: "/chat",
    route: chat
  }
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route)
})

module.exports = router