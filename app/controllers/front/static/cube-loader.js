class CubeLoaderView extends CubeView {
  static get TAG() {
    return 'cube-loader-view';
  }

  async canActivate() {
    return !app.initialized;
  }

  attachedCallback() {
    super.attachedCallback();
  }
}
