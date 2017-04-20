class RacoonAuth extends Service {
  init() {
    return this.app.api.me()
      .then(me => {
        this.user = me;
      })
      .catch(_ => {
        //no authorization yet
      })
  }

  set user(user) {
    this._user = user;
    this.app.emit('authorized');
  }

  get user() {
    return this._user;
  }

  get authorized() {
    return !!this._user
  }

  login({email, password}) {
    return this.app.api.login({email, password})
      .then(user => {
        this.user = user
      })
  }

  logout() {
    document.cookie = 'token=;expires=' + new Date().toUTCString();
  }
}
