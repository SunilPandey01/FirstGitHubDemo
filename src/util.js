var nodeEnv = process.env.NODE_ENV;
var path = require('path');
var fs = require('fs');
var CERTFILE = path.join(__dirname, './certificates/oc-integrator.p12');
const cert = fs.readFileSync(CERTFILE);
var constants = require('./constants.js');
var moment = require('moment');

module.exports = {
  addAgentOptions: function (options) {
      if (nodeEnv === constants.NODE_ENV_PROD)   {
          options.agentOptions = {
              'pfx': cert,
              'passphrase': process.env.AGENT_OPTION_PASSPHRASE
          }
      }
  },

  buildAWDRequestField: function (createXML, fieldName, fieldValue)   {
      fieldEle = createXML.createElement(constants.FIELD_TAG_NAME);
      fieldEle.setAttribute(constants.FIELD_ATTR_NAME, fieldName);
      valueEle = createXML.createElement(constants.VALUE_TAG_NAME);
      valueText = createXML.createTextNode(fieldValue);
      valueEle.appendChild(valueText);
      fieldEle.appendChild(valueEle);
      createXML.getElementsByTagName(constants.FIELDS_TAG_NAME)[0].appendChild(fieldEle);
  },

  formatDateTime: function(date, time) {
      var dateTimeStr = date + constants.SPACE + time;
      return moment.utc(dateTimeStr).format(constants.DATE_TIME_FORMAT);
  },

  populatePRTPRelatedFields: function(createXML, product_code) {
    var prtp, rqty;

    switch(product_code) {
      case 'A1': case 'A5':
        prtp = constants.PRTP_A;
        rqty = constants.RQTY_F;
        break;
      case 'A2':
        prtp = constants.PRTP_A;
        rqty = constants.RQTY_V;
        break;
      case 'U1': case 'T1': case 'T2':
        prtp = constants.PRTP_L;
        rqty = constants.RQTY_F;
        break;
      case 'U2':
        prtp = constants.PRTP_L;
        rqty = constants.RQTY_V;
        break;
    }

    // PRTP field
    this.buildAWDRequestField(createXML, constants.PRTP, prtp);
    
    // RQTY field
    this.buildAWDRequestField(createXML, constants.RQTY, rqty);
  },

  spiltName: function(name, createXML) {
    var nameArr = name.split(constants.SPACE);

    if (nameArr.length > 0) {
      switch(nameArr.length)  {
        // WMEEMBY
        case 1:
          this.buildAWDRequestField(createXML, constants.INSF, nameArr[0]);
          break;
        // WMEEMBY LIYJACFV
        case 2:
          this.buildAWDRequestField(createXML, constants.INSF, nameArr[0]);
          this.buildAWDRequestField(createXML, constants.INSL, nameArr[1]);
          break;
        // WMEEMBY L LIYJACFV
        // WMEEMBY L LIYJACFV JR (Suffix 'JR' is ignored)
        default:
          this.buildAWDRequestField(createXML, constants.INSF, nameArr[0]);
          this.buildAWDRequestField(createXML, constants.INSM, nameArr[1]);
          this.buildAWDRequestField(createXML, constants.INSL, nameArr[2]);
          break;
      }
    }
  },

  formatRequestDataToAWD: function(req) {
    // 1) Strip age from date of birth sent as '01/11/1957 (64)'
    var dob = req.body.birth_date;
    if (dob && dob.includes('(')) {
      req.body.birth_date = dob.substring(0, dob.indexOf('(')).trim();
    }

    // 2) Replace all and remove hyphens from tin send as '423-82-6773'
    var tin = req.body.tin;
    if (tin && tin.includes('-')) {
      req.body.tin = tin.split('-').join('');
    }
  },

  // Populate fields present in the Map dynamically
  populateAWDFields: function(awdFieldsMap, createXML, req) {
    for (let elem of awdFieldsMap.entries()) {
      var fieldValue = eval('req.body.' + `${elem[1]}`);
      if (fieldValue) {
        this.buildAWDRequestField(createXML, `${elem[0]}`, fieldValue);
      }
    }
  }
}