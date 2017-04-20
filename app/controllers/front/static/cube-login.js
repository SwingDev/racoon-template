class CubeLoginView extends CubeView {
  static get TAG() {
    return 'cube-login-view';
  }

  async canActivate() {
    return app.initialized && !app.auth.authorized;
  }

  submit(evt) {
    const form = this.querySelector('form');
    evt.preventDefault();
    evt.stopPropagation();

    services.auth
      .login({
        email: form.elements.email.value,
        password: form.elements.password.value,
      })
      .then(user => {
        this.parent.next('up');
      })
      .catch(error => {
        console.error('login error', error);
        app.showError(error.error || 'Login failed')
      })
  }
}
