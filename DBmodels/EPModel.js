var express = require('express');
var mongoose = require('mongoose');
var encryptor = require('mongoose-encryption');

//encKey generated using command - openssl rand -base64 32;
var encKey = 'esFTSM34OSY9VexbRMJ2Jtnki1fYoGRZhQFOz0V6UZE=';//process.env.SOME_32BYTE_BASE64_STRING;
//sigKey generated using command - openssl rand -base64 64;
var sigKey = 'TRs1JfsxMcwdavI0dDYmcJeBr7SyEBPn1Ly1/EQCNvnAx/jLCwo0oHv9m+bjykFydhStlGrCbwZvoZwPGNjytw==';//process.env.SOME_64BYTE_BASE64_STRING;

var EPSchema = new mongoose.Schema({
    id: Number,
    content: String,
    choices: Object,
    correctChoice: String,
    category: String,
    image: String
});

//encrypt fields
EPSchema.plugin(encryptor, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['content', 'correctChoice', 'choices'] });

module.exports = mongoose.model('EPModel', EPSchema);