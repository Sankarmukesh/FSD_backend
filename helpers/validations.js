const joi = require('@hapi/joi')

const authSchema = joi.object({
    userName: joi.string(),
    role: joi.string(),
    email: joi.string().email(),
    password: joi.string().min(2),
    image: joi.string(),
    type: joi.string(),
})

module.exports={
    authSchema
}