const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

exports.uploadToS3 = async function uploadToS3 (file) {
    const s3 = new S3Client({
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECREY_ACCESS_KEY,
        },
        forcePathStyle: true,
    });

    const bucketName = process.env.S3_BUCKET_NAME;
    const key = `resumes/${Date.now()}_${file.originalname}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });
    await s3.send(command);

    const fileUrl = `${process.env.S3_MEDIA_URL}/${bucketName}/${key}`;
    return fileUrl;
};
