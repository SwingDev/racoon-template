class CubeApp extends HTMLElement {
  static get TAG() {
    return 'cube-app';
  }

  static get DURATION() {
    return 250;
  }

  createdCallback() {
    this._onDocumentKeyup = this._onDocumentKeyup.bind(this);
  }

  attachedCallback() {
    this.views = Array.from(this.childNodes);

    this._currentViewId = 0;
    this._currentView = this.views[this._currentViewId];

    setTimeout(_ => {
      this.views.forEach(el => {
        if (el === this._currentView) {
          el.activate();
        } else {
          el.deactivate();
        }
      })
    });

    this._addListeners();
  }


  async next(direction = this._randomDirection()) {
    const next = await this._getNextView(direction);
    return this.activate(next, direction);
  }

  async activate(view, direction = this._randomDirection()) {
    if (_.isString(view)) {
      view = _.find(this.views, v => v.id === view);
    }

    if (this._active) {
      this._nextView = view;
      this._nextMove = direction;
      return;
    }

    const current = this._currentView;
    const next = view;
    const nextId = this.views.indexOf(next);

    if (next === current) {
      return;
    }

    this._active = true;

    this.deactivateView(current);

    // current.style.willChange = 'transform, opacity';
    next.style.willChange = 'transform, opacity';

    const {exit: currentFlip, enter: nextFlip} = this._getFrames(direction);

    const timing = {
      duration: CubeApp.DURATION,
      iterations: 1,
      easing: 'ease-in-out',
      fill: 'forwards'
    };

    await current._beforeDeactivate();
    await next._beforeActivate();
    // console.log('next activated')

    return new Promise((resolve, reject) => {
      this.showView(next);
      // console.log('before rAF')
      requestAnimationFrame(_ => {
        // console.log('current.animate');
        current.animate(currentFlip, timing);

        // console.log('next.animate');
        next.animate(nextFlip, timing).onfinish = _ => {
          // console.log('next.animate.onfinish');
          this._active = false;

          this._currentViewId = nextId;
          this._currentView = next;

          this.activateView(next);
          this.hideView(current);

          if (this._nextMove) {

            const nextMove = this._nextMove;
            const nextView = this._nextView;

            this._nextMove = undefined;
            this._nextView = undefined;

            return this.activate(nextView, nextMove)
              .then(resolve, reject)
          }

          // next.style.willChange = '';
          // current.style.willChange = '';

          resolve();
        }
      })
    })
  }

  showView(view) {
    view.classList.add('cube-view--visible');
  }

  activateView(view) {
    view.classList.add('cube-view--active');

    view._activate();
  }

  hideView(view) {
    view.classList.remove('cube-view--visible');
  }

  deactivateView(view) {
    view.classList.remove('cube-view--active');

    view._deactivate();
  }


  showError(message) {
    console.log(message);

    function rand(max) {
      return Math.round(Math.random() * max) - max / 2;
    }

    function log(obj) {
      console.log(obj);
      return obj;
    }

    this._currentView.animate(log([
      {transform: `translate3d(0, 0, 0)`},
      {transform: `translate3d(${rand(5)}px, ${rand(20)}px, ${rand(10)}px) rotateY(${rand(50)}deg)`},
      {transform: `translate3d(${rand(5)}px, ${rand(20)}px, ${rand(10)}px) rotateY(${rand(50)}deg)`},
      {transform: `translate3d(${rand(5)}px, ${rand(20)}px, ${rand(10)}px) rotateY(${rand(50)}deg)`},
      {transform: `translate3d(${rand(5)}px, ${rand(20)}px, ${rand(10)}px) rotateY(${rand(50)}deg)`},
      {transform: `translate3d(0, 0, 0)`},

    ]), {
      duration: CubeApp.DURATION,
      iterations: 1,
    })
  }

  async _getNextView(direction) {
    const delta = (direction === 'left' || direction === 'up') ? 1 : -1;

    let nextView,
        nextViewId = this._currentViewId;

    do {
      nextViewId = (nextViewId + delta + this.views.length) % this.views.length;
      nextView = this.views[nextViewId];

    } while (await this._canActivate(nextView));

    return nextView;
  }

  async _canActivate(view) {
    return view !== this._currentView && !await view.canActivate()
  }

  _randomDirection() {
    return ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)]
  }

  _getFrames(direction) {
    let exit, enter, axis;

    switch (direction) {
      default:
        console.warn('Direction not specified, fallback to right');

      case 'right':
        axis = 'Y';

        exit = [
          {transform: `rotate${axis}(0deg)`, opacity: 1},
          {transform: `rotate${axis}(90deg)`, opacity: 0},
        ];

        enter = [
          {transform: `rotate${axis}(-90deg)`, opacity: 0},
          {transform: `rotate${axis}(0deg)`, opacity: 1},
        ];
        break;

      case 'left':
        axis = 'Y';

        exit = [
          {transform: `rotate${axis}(0deg)`, opacity: 1},
          {transform: `rotate${axis}(-90deg)`, opacity: 0},
        ];

        enter = [
          {transform: `rotate${axis}(90deg)`, opacity: 0},
          {transform: `rotate${axis}(0deg)`, opacity: 1},
        ];
        break;

      case 'up':
        axis = 'X';

        exit = [
          {transform: `rotate${axis}(0deg)`, opacity: 1},
          {transform: `rotate${axis}(90deg)`, opacity: 0},
        ];

        enter = [
          {transform: `rotate${axis}(-90deg)`, opacity: 0},
          {transform: `rotate${axis}(0deg)`, opacity: 1},
        ];
        break;

      case 'down':
        axis = 'X';

        exit = [
          {transform: `rotate${axis}(0deg)`, opacity: 1},
          {transform: `rotate${axis}(-90deg)`, opacity: 0},
        ];

        enter = [
          {transform: `rotate${axis}(90deg)`, opacity: 0},
          {transform: `rotate${axis}(0deg)`, opacity: 1},
        ];
        break;

    }

    return {
      exit, enter
    }
  }

  _addListeners() {
    document.addEventListener('keyup', this._onDocumentKeyup);
  }

  _onDocumentKeyup(evt) {
    if(evt.target.tagName === 'INPUT') return;

    switch (evt.keyCode) {
      case 37:
        this.next('right');
        break;
      case 38:
        this.next('down');
        break;
      case 39:
        this.next('left');
        break;
      case 40:
        this.next('up');
        break;
    }
  }
}
