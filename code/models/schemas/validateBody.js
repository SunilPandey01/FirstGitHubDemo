const Joi = require('joi');

/** If Bucket is present, Key must be present and the other way round */
/* Either Bucket and Key or Filepath must be present */
/* Both may be present */

const schema = Joi.object().keys({
    Bucket: Joi.string().min(3).optional(),
    Key: Joi.string().optional(),
    Filepath: Joi.string().optional()
}).and('Bucket', 'Key').or('Filepath', 'Bucket');



module.exports = {
    validateBody: function(reqBody){
        return schema.validate(reqBody); 
    }
}