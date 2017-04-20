class CubeWithdrawView extends CubeView {
  static get TAG() {
    return 'cube-withdraw-view';
  }

  async submit(evt) {
    evt.preventDefault();

    const form = this.querySelector('form');

    let fromAccount = form.elements.fromAccount.value;
    let toCard = form.elements.toCard.value;
    let amount = form.elements.amount.value;

    await app.api.withdraw(fromAccount, toCard, amount);
    const account = await app.api.account(fromAccount);

    app.showMessage(`Balance: ${account.balance} ${account.currencyId}`);
    app.activate('convert');
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
