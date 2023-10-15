import * as Minio from 'minio';

let minioClient = null;

export function uploadProfileImage(userId, image) {
  if (minioClient === null)
      initializeMinioClient();
  const bucketName = 'secret-santa-images';
  const fileName = userId + '.png';
  return minioClient.putObject(bucketName, fileName, image);
}

export function getProfileImage(userId) {
  if (minioClient === null)
    initializeMinioClient();
  const bucketName = 'secret-santa-images';
  const fileName = userId + '.png';
  return minioClient.getObject(bucketName, fileName);
}

function initializeMinioClient() {
  minioClient = new Minio.Client({
    endPoint: process.env.minioEndPoint,
    port: parseInt(process.env.minioPort),
    useSSL: process.env.minioUseSSL === true,
    accessKey: process.env.minioAccessKey,
    secretKey: process.env.minioSecretKey,
  });
}