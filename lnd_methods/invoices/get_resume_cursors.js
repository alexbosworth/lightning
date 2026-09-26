const asyncDoUntil = require('async/doUntil');

const {isArray} = Array;
const isString = n => typeof n === 'string';
const lastPageFirstIndexOffset = 1;
const maxOf = (a, b) => Math.max(Number(a) || 0, Number(b) || 0) || undefined;
const maxPages = 100;
const method = 'listInvoices';
const pageSize = 100;
const type = 'default';
const {values} = Object;

/** Get the newest invoice add and settle indexes to resume a subscription from

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk
  {
    [add_index]: <Newest Invoice Add Index Number>
    [settle_index]: <Newest Found Invoice Settle Index Number>
  }
*/
module.exports = ({lnd}, cbk) => {
  let addIndex;
  let offset;
  let pages = 0;
  let settleIndex;

  return asyncDoUntil(
    cbk => {
      return lnd[type][method]({
        index_offset: offset || Number(),
        num_max_invoices: pageSize,
        reversed: true,
      },
      (err, res) => {
        if (!!err) {
          return cbk([503, 'UnexpectedErrorGettingResumeCursors', {err}]);
        }

        if (!res || !isArray(res.invoices)) {
          return cbk([503, 'ExpectedInvoicesToGetInvoiceResumeCursors']);
        }

        if (!isString(res.first_index_offset)) {
          return cbk([503, 'ExpectedFirstIndexOffsetForInvoiceResumeCursors']);
        }

        pages++;

        // Track the highest add index and settle index seen across the pages
        res.invoices.forEach(invoice => {
          addIndex = maxOf(addIndex, invoice.add_index);
          settleIndex = maxOf(settleIndex, invoice.settle_index);

          // AMP invoices settle by HTLC set, the sets have the settle indexes
          values(invoice.amp_invoice_state || {}).forEach(set => {
            settleIndex = maxOf(settleIndex, set.settle_index);

            return;
          });

          return;
        });

        offset = Number(res.first_index_offset);

        return cbk(null, res.invoices.length);
      });
    },
    (count, cbk) => {
      // Stop when a settled invoice was found
      if (!!settleIndex) {
        return cbk(null, true);
      }

      // Stop when the page was not full, there are no more invoices
      if (count < pageSize) {
        return cbk(null, true);
      }

      // Stop when the page reached the first invoice
      if (offset <= lastPageFirstIndexOffset) {
        return cbk(null, true);
      }

      // Stop when the page limit is reached
      return cbk(null, pages === maxPages);
    },
    err => {
      if (!!err) {
        return cbk(err);
      }

      return cbk(null, {add_index: addIndex, settle_index: settleIndex});
    }
  );
};
