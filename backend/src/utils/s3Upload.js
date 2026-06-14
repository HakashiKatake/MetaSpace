const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

async function uploadToS3(key, body, contentType = 'application/octet-stream') {
  const command = new PutObjectCommand({
    Bucket:      process.env.AWS_BUCKET_NAME,
    Key:         key,
    Body:        body,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  });
  return s3.send(command);
}

module.exports = { uploadToS3 };
