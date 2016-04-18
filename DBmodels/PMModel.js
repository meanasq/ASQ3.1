var express = require('express');
var mongoose = require('mongoose');
var encryptor = require('mongoose-encryption');

//encKey generated using command - openssl rand -base64 32;
var encKey = process.env.encKey;
//sigKey generated using command - openssl rand -base64 64;
var sigKey = process.env.sigKey;

var PMSchema = new mongoose.Schema({
    id: Number,
    content: String,
    choices: Object,
    correctChoice: String,
    category: String,
    image: String
});
//encrypt fields
PMSchema.plugin(encryptor, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['content', 'correctChoice', 'choices'] });

module.exports = mongoose.model('PMModel', PMSchema);
