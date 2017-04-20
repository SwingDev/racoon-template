class Service {
  constructor({app}) {
    this.app = app;
  }

  init() {
    return Promise.resolve()
  }
}

class App extends EventEmitter {
  constructor({root, services, elements}) {
    super();

    this.initialized = false;
    this.root = document.querySelector(root);
    this.snackbar = new mdc.snackbar.MDCSnackbar(document.querySelector('.mdc-snackbar'));

    this.addListeners();

    elements.forEach(m => this._registerElement(m.TAG, m))

    const svcs = Object.keys(services)
      .map(name => this._createService(name, services[name]))
      .map(service => service.init());

    Promise.all(svcs)
      .then(_ => new Promise(resolve => setTimeout(resolve, 3e3)))
      .then(_ => this.initialized = true)
      .then(_ => {
        this.activate(app.auth.authorized ? 'convert' : 'login', 'up')
      })
  }

  addListeners() {
    window.addEventListener('unhandledrejection', e => {
      this.showError(e.reason.error || 'An unknown error occurred :(')
    })
  }

  showMessage(message) {
    this.snackbar.show({
      message
    });
    this.snackbar.getDefaultFoundation().adapter_.removeClass('mdc-snackbar--error')
  }

  showError(message) {
    this.snackbar.show({
      message
    });
    this.snackbar.getDefaultFoundation().adapter_.addClass('mdc-snackbar--error')
  }

  _createService(name, factory) {
    return this[name] = new factory({app: this});
  }

  _registerElement(tag, factory) {
    factory.app = this;
    document.registerElement(tag, factory);
  }

  next(...args) {
    this.root.next(...args);
  }

  activate(...args) {
    this.root.activate(...args);
  }

  printBalance() {
    this.api.myAccounts()
      .then(accounts => {
        accounts.forEach(a => {
          console.log(`Account#${a.id} balance: ${a.balance} ${a.currencyId.toUpperCase()}`)
        });
      });


    this.api.myCards()
      .then(cards => {
        return Promise.all(cards.map(c => {
          return this.api.cardBalance(c.id)
            .then(balance => {
              console.log(`Card#${c.id} (${c.name}, ${c.type}) balance:`, balance.map(b => `${b.balance} ${b.currency}`).join(', '));
            })
        }))
      })
  }
}
