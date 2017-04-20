class RacoonApi extends Service {
  login({email, password}) {
    return fetch('/auth/login', {
      method: 'post',
      body: JSON.stringify({
        email, password
      }),
      headers: {'content-type': 'application/json'},
      credentials: 'same-origin',
    }).then(this._handleResponse)
  }

  me() {
    return fetch('/api/user/me', {
      credentials: 'same-origin',
    }).then(this._handleResponse)
  }

  myAccounts() {
    return fetch('/api/user/me/accounts', {
      credentials: 'same-origin',
    }).then(this._handleResponse)
      .then(list => {
        return Promise.all(_.sortBy(list, 'id').map(a => this.account(a.id)));
      })
  }

  myCards() {
    return fetch('/api/user/me/credit_cards', {
      credentials: 'same-origin',
    }).then(this._handleResponse)
      .then(list => {
        return Promise.all(_.sortBy(list, 'id').map(a => this.card(a.id)));
      })
  }

  account(id) {
    return fetch(`/api/account/${id}`, {
      credentials: 'same-origin',
    }).then(this._handleResponse)
  }

  card(id) {
    return fetch(`/api/credit_card/${id}`, {
      credentials: 'same-origin',
    }).then(this._handleResponse)
  }

  cardBalance(id) {
    return fetch(`/api/credit_card/${id}/balance`, {
        credentials: 'same-origin',
    }).then(this._handleResponse)
  }

  rates() {
    return fetch(`/api/rate`, {
      credentials: 'same-origin',
    }).then(this._handleResponse)
  }

  topup(fromCardId, toAccountId, amount) {
    return fetch(`/api/credit_card/${fromCardId}/deposit`, {
      method: 'post',
      body: JSON.stringify({to_account_id: toAccountId, amount: amount}),
      credentials: 'same-origin',
      headers: {'content-type': 'application/json'},
    }).then(this._handleResponse)
  }

  withdraw(fromAccountId, toCardId, amount) {
    return fetch(`/api/account/${fromAccountId}/withdraw`, {
      method: 'post',
      body: JSON.stringify({to_credit_card_id: toCardId, amount: amount}),
      credentials: 'same-origin',
      headers: {'content-type': 'application/json'},
    }).then(this._handleResponse)
  }

  convert(fromAccountId, toAccountId, amount) {
    return fetch(`/api/account/${fromAccountId}/convert`, {
      method: 'post',
      body: JSON.stringify({to_account_id: toAccountId, amount: amount}),
      credentials: 'same-origin',
      headers: {'content-type': 'application/json'},
    }).then(this._handleResponse)
  }

  _handleResponse(response) {
    if (response.ok) {
      return response.json()
    }

    return response.json().then(json => Promise.reject(json));
  }
}
