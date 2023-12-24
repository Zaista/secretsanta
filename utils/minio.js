import * as Minio from 'minio';

let minioClient = null;
const bucketName = 'secret-santa-images';

export function uploadImageToMinio(userId, image) {
  if (minioClient === null) { initializeMinioClient(); }
  const fileName = userId + '.png';
  return minioClient.putObject(bucketName, fileName, image);
}

export function getImageFromMinio(userId) {
  if (minioClient === null) { initializeMinioClient(); }
  const fileName = userId + '.png';
  return minioClient.getObject(bucketName, fileName);
}

function initializeMinioClient() {
  let port = null;
  if (process.env.minioPort !== undefined) {
    port = parseInt(process.env.minioPort);
  }
  minioClient = new Minio.Client({
    endPoint: process.env.minioEndPoint,
    port,
    useSSL: process.env.minioUseSSL === 'True',
    accessKey: process.env.minioAccessKey,
    secretKey: process.env.minioSecretKey
  });
}
