class CubeView extends HTMLElement {
  static get TAG() {
    return 'cube-view';
  }

  async canActivate() {
    return services.auth.authorized;
  }

  get parent() {
    return this.parentNode;
  }

  createdCallback() {
    this.classList.add('cube-view');
  }

  attachedCallback() {
    this._listeners = [];
    this._templates = this.querySelectorAll('script');

    const self = this;

    this._trap = createFocusTrap(this, {
      initialFocus: this,
      // onActivate() {
      //   console.log('activated on', self);
      // },
      // onDeactivate() {
      //   console.log('deactivated on', self);
      // },
      fallbackFocus: () => {
        console.warn('fallback focus', self);
        return this;
      }
    });
  }

  next(direction) {
    app.next(direction)
  }

  navigate(to, direction) {
    app.activate(to, direction)
  }

  beforeActivate() {
    this.render({});
  }
  beforeDeactivate() {}
  activate() {}
  deactivate() {}

  _beforeActivate() {
    return this.beforeActivate();
  }

  _beforeDeactivate() {
    return this.beforeDeactivate();
  }

  _activate() {
    this._trap.activate();
    return this.activate();
  }

  _deactivate() {
    this._trap.deactivate();
    this._removeListeners();
    return this.deactivate();
  }

  render(context) {
    this._onBeforeRender();

    this.querySelectorAll('[compiled]')
      .forEach(c => c.remove());

    this._templates.forEach(e => {
      if (!e.__id) {
        e.__id = _.uniqueId('tpl');
      }

      if (!e.__compiled) {
        e.__compiled = Handlebars.compile(e.innerText)
      }

      const tpl = document.createElement('template');
      tpl.innerHTML = e.__compiled(context);

      const clone = document.importNode(tpl.content, true);
      clone.childNodes.forEach(n => n.setAttribute('compiled', e.__id));
      e.parentNode.insertBefore(clone, e);
    });

    this._onAfterRender();
  }

  _addListener(element, eventName, eventHandler, eventOptions) {
    this._listeners.push([element, eventName, eventHandler]);
    element.addEventListener(eventName, eventHandler, eventOptions);
  }

  _removeListeners() {
    this._listeners.forEach(
      ([element, type, listener]) =>
        element.removeEventListener(type, listener)
    );

    this._listeners.length = 0;
  }

  _onBeforeRender() {
    this._removeListeners();
  }

  _onAfterRender() {
    //attach listeners
    this.querySelectorAll('[on]')
      .forEach(element => {
        const type = element.getAttribute('on');
        const expr = this._compileExpression(element.getAttribute('do'));

        const listener = function(event) {
          return expr({event})
        };

        if (type) {
          this._addListener(element, type, listener);
        }
      })
  }

  _compileExpression(expression) {
    const {name, params} = this._parseExpression(expression);

    const method = this[name];

    return (locals) => {
      // console.log(name, params,locals)
      const context = this;
      method.apply(context, params.map(name => {
        if(name in locals) {
          return locals[name];
        }
        return _.trim(name, "'\"");
      }))
    }
  }

  _parseExpression(expression) {
    let name, params, tail;
    ([name, tail] = expression.split('(', 2));

    if(tail) {
      ([params, tail] = tail.split(')', 2));
    }

    return {
      name,
      params: params ? params.split(',').map(x => x.trim()) : []
    }

  }
}
