Handlebars.registerHelper("checked", function (condition) {
  return condition ? "checked" : "";
});

window.app = window.services = new App({
  root: 'cube-app',
  services: {
    auth: RacoonAuth,
    api: RacoonApi,
    account: RacoonAccount
  },

  elements: [
    CubeApp,
    CubeView,
    CubeLoaderView,
    CubeLoginView,
    CubeConvertView,
    CubeWithdrawView,
    CubeTopupView,
  ]
});
