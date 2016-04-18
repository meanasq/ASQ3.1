var express = require('express');
var mongoose = require('mongoose');
var encryptor = require('mongoose-encryption');

//encKey generated using command - openssl rand -base64 32;
var encKey = process.env.encKey;
//sigKey generated using command - openssl rand -base64 64;
var sigKey = process.env.sigKey;

var SQMSchema = new mongoose.Schema({
    id: Number,
    content: String,
    choices: Object,
    correctChoice: String,
    category: String,
    image: String
});
//encrypt fields
SQMSchema.plugin(encryptor, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['content', 'correctChoice', 'choices'] });

module.exports = mongoose.model('SQMModel', SQMSchema);