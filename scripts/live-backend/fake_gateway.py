"""
An offline stand-in for Flutterwave, installed into the local backend for live tests so nothing ever
leaves the machine. Every checkout "succeeds": create_payment_link remembers the charge and returns a
link carrying a transaction id; verify calls answer with that charge as successful; refunds succeed
and are written to the payment ledger exactly as real ones are.
"""
import itertools

_charges = {}            # transaction id -> {tx_ref, amount, currency, email}
_by_ref = {}             # tx_ref -> transaction id
_ids = itertools.count(9_100_001)


def install():
    from apps.shared.payment import FlutterwaveService
    from apps.shared.payment_ledger import record_gateway_refund

    def create_payment_link(self, config):
        txn = next(_ids)
        _charges[txn] = {'tx_ref': config['tx_ref'], 'amount': float(config['amount']), 'currency': config.get('currency', 'NGN'),
                         'email': (config.get('customer') or {}).get('email', '')}
        _by_ref[config['tx_ref']] = txn
        # "Checkout" sends the payer straight back to the app's return address, as Flutterwave does after paying.
        back = config.get('redirect_url') or 'http://localhost:3000/payments/complete'
        sep = '&' if '?' in back else '?'
        return f"{back}{sep}status=successful&tx_ref={config['tx_ref']}&transaction_id={txn}"

    def _record(txn):
        charge = _charges.get(int(txn))
        if not charge:
            return {'status': 'error', 'message': 'No transaction was found for this id', 'data': None}
        return {'status': 'success', 'data': {
            'id': int(txn), 'tx_ref': charge['tx_ref'], 'status': 'successful', 'amount': charge['amount'],
            'currency': charge['currency'], 'customer': {'email': charge['email']}}}

    def verify_transaction(self, transaction_id):
        return _record(transaction_id)

    def verify_by_reference(self, tx_ref):
        return _record(_by_ref.get(tx_ref, 0))

    def refund(self, transaction_id, amount):
        data = {'id': next(_ids), 'status': 'completed', 'amount_refunded': str(amount)}
        record_gateway_refund(transaction_id, amount, ok=True, refund_data=data)
        return data

    FlutterwaveService.create_payment_link = create_payment_link
    FlutterwaveService.verify_transaction = verify_transaction
    FlutterwaveService.verify_by_reference = verify_by_reference
    FlutterwaveService.refund = refund
    # Any other path (e.g. fetch_charge) goes through _get: answer from the same records.
    original_get = FlutterwaveService._get

    def _get(self, endpoint, params=None, **kwargs):
        if '/transactions/' in endpoint and endpoint.endswith('/verify'):
            return _record(endpoint.rstrip('/').split('/')[-2])
        if endpoint.endswith('verify_by_reference'):
            return verify_by_reference(self, (params or {}).get('tx_ref'))
        return original_get(self, endpoint, params=params, **kwargs)

    FlutterwaveService._get = _get
