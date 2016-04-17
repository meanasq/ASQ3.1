var express = require('express');
var mongoose = require('mongoose');
var encryptor = require('mongoose-encryption');

//encKey generated using command - openssl rand -base64 32;
var encKey = 'esFTSM34OSY9VexbRMJ2Jtnki1fYoGRZhQFOz0V6UZE=';//process.env.SOME_32BYTE_BASE64_STRING;
//sigKey generated using command - openssl rand -base64 64;
var sigKey = 'TRs1JfsxMcwdavI0dDYmcJeBr7SyEBPn1Ly1/EQCNvnAx/jLCwo0oHv9m+bjykFydhStlGrCbwZvoZwPGNjytw==';//process.env.SOME_64BYTE_BASE64_STRING;

//Updated by Srinivas Thungathurti for ASQ Upgrade 2.0
var userSchema = new mongoose.Schema({
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zipcode: String,
    role: String,
    activeIn: String,
    expiryDate: String,    
    birthDate: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});
//encrypt fields
userSchema.plugin(encryptor, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['role', 'activeIn'] });

userSchema.methods.validPassword = function( pwd ) {
    return ( this.password === pwd );
};

//End Changes for ASQ Upgrade 2.0 here.

module.exports = mongoose.model('userModel', userSchema);