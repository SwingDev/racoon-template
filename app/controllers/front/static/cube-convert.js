class CubeConvertView extends CubeView {
  static get SIGNS() {
    return {
      USD: '$',
      PLN: 'zł'
    }
  }

  static get TAG() {
    return 'cube-convert-view';
  }

  createdCallback() {
    super.createdCallback()

    this.rangeChanged = _.throttle(this.rangeChanged, 50)
  }

  canActivate() {
    return services.auth.authorized;
  }

  render() {
    super.render(this.context)
  }

  async beforeActivate() {
    return this.refresh();
  }

  async refresh() {
    this.context = {};

    await this.updateBalance();
    await this.updateRates();

    this.render();
  }

  async updateBalance() {
    this.context.accounts = await app.account.list()
      .then(accounts => {
        return accounts.map(a => {
          const label = a.currencyId.toUpperCase();
          return Object.assign(a, {
            label: CubeConvertView.SIGNS[label] || label,
          })
        })
      })
  }

  async updateRates() {
    this.context.rates = await app.api.rates()
  }

  async convert(evt) {
    evt.preventDefault();

    const conversionIndex = parseFloat(evt.target.elements.conversionIndex.value);
    if(conversionIndex) {
      const deal = this.getConversionOptions(conversionIndex);
      await app.api.convert(deal.from.id, deal.to.id, deal.saleAmount)

      this.refresh();
    }
  }

  rangeChanged(evt) {
    const index = evt.target.value;

    const {from, to, saleAmount, buyAmount} = this.getConversionOptions(index);

    this.querySelector(`[bind-balance-change='${from.id}']`)
      .innerHTML = `<span class="sell-amount">-${saleAmount}</span>`;

    this.querySelector(`[bind-balance-change='${to.id}']`)
      .innerHTML = `<span class="buy-amount">+${buyAmount}</span>`;

  }

  getConversionOptions(conversionIndex) {
    const fromId = conversionIndex > 0 ? 1 : 0;
    const toId = conversionIndex > 0 ? 0 : 1;
    const from = this.getAccount(fromId);
    const to = this.getAccount(toId);

    const salePortion = from.balance > 0 ? Math.abs(conversionIndex / from.balance) : 0;
    const saleAmount = (from.balance * salePortion).toFixed(2);

    const rate = this.getRate(fromId, toId);

    const buyAmount = (saleAmount * rate).toFixed(2);

    return {
      from,
      saleAmount,
      to,
      buyAmount
    }
  }

  getAccount(id) {
    return this.context.accounts[id];
  }

  getRate(fromId, toId) {
    const fromCurrency = this.getAccount(fromId).currencyId;
    const toCurrency = this.getAccount(toId).currencyId;

    return _.find(this.context.rates, {fromId: fromCurrency, toId: toCurrency}).rate
  }
}
