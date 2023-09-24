const requireLogin = require('../middlewares/requireLogin');
const keys = require('../config/keys');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: keys.awsAccessKeyId,
    secretAccessKey: keys.awsSecretAccessKey
  },
  region: 'eu-central-1'
});

module.exports = app => {
  app.get('/api/upload', requireLogin, async (req, res) => {
    const fileName = `${req.user.id}/${uuidv4()}.jpeg`;

    const params = {
      Bucket: 'playground-node-advanced-blog-bucket',
      ContentType: 'iamge/jpeg',
      Key: fileName
    };

    const url = s3.getSignedUrl('putObject', params);

    res.send({ fileName, url });
  });
};
