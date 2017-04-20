class CubeTopupView extends CubeView {
  static get TAG() {
    return 'cube-topup-view';
  }

  async submit(evt) {
    evt.preventDefault();

    const form = this.querySelector('form');

    let fromCard = form.elements.fromCard.value;
    let toAccount = form.elements.toAccount.value;
    let amount = form.elements.amount.value;

    await app.api.topup(fromCard, toAccount, amount);

    const account = await app.api.account(toAccount);

    app.activate('convert');
    app.showMessage(`Balance: ${account.balance} ${account.currencyId}`);
  }

  canActivate() {
    return services.auth.authorized;
  }

  async beforeActivate() {
    const context = {
      cards : await app.api.myCards(),
      accounts: await app.api.myAccounts()
    };

    this.render(context);
  }
}
