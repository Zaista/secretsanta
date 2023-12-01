import * as Minio from 'minio';

let minioClient = null;
const bucketName = 'secret-santa-images';

export function uploadProfileImageToMinio(userId, image) {
  if (minioClient === null) { initializeMinioClient(); }
  const fileName = userId + '.png';
  return minioClient.putObject(bucketName, fileName, image);
}

export function getProfileImageFromMinio(userId) {
  if (minioClient === null) { initializeMinioClient(); }
  const fileName = userId + '.png';
  return minioClient.getObject(bucketName, fileName);
}

export function uploadLocationImageToMinio(yearId, image) {
  if (minioClient === null) { initializeMinioClient(); }
  const fileName = yearId + '.png';
  return minioClient.putObject(bucketName, fileName, image);
}

export function getLocationImageFromMinio(yearId) {
  if (minioClient === null) { initializeMinioClient(); }
  const fileName = yearId + '.png';
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
    useSSL: process.env.minioUseSSL === 'true',
    accessKey: process.env.minioAccessKey,
    secretKey: process.env.minioSecretKey
  });
}
