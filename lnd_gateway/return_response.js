const {encode} = require('cbor');

const cborType = 'application/cbor';
const serverErrorCode = 500;

/** Return response

  {
    res: {
      send: <Send Response Body Function>
      status: <Set Response Status Code Function>
      type: <Set Response Content Type Header Function>
    }
  }

  @returns
  {
    responder: <Responder Function>
  }
*/
module.exports = ({res}) => {
  const responder = (err, response) => {
    if (!!err) {
      return res.status(serverErrorCode) && res.send();
    }

    try {
      const result = {err: response.err, res: response.res};

      return res.type(cborType) && res.send(encode(result));
    } catch (err) {
      return res.status(serverErrorCode) && res.send();
    }
  };

  return {responder};
};
