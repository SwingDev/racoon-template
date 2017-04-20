class RacoonAccount extends Service {
  init() {
    super.init();
    this.app.on('authorized', _ => this.onAuthorized())
  }

  onAuthorized() {}

  list() {
    return this.app.api.myAccounts()
  }

  byId(id) {
    return this.app.api.account(id)
  }
}
