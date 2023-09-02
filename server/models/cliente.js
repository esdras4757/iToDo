const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const clientSchema = mongoose.Schema({
    nombre: {type: String, required: true},
    correo: {type: String, required: true},
    apellido: {type: String, required: true},
    edad: {type: Number, required: true},
    telefono: {type: Number, required: true},
    pass: {type: String, required: true}
})

clientSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('pass')) {
            return next();
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.pass, salt);
        this.pass = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});


module.exports = mongoose.model('User', clientSchema);