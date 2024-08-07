import * as Minio from 'minio';

let minioClient = null;

export function uploadImageToMinio(imageId, image) {
  if (minioClient === null) {
    initializeMinioClient();
  }
  const fileName = imageId + '.png';
  return minioClient.putObject(process.env.minioBucket, fileName, image);
}

export function getImageFromMinio(imageId) {
  if (minioClient === null) {
    initializeMinioClient();
  }
  const fileName = imageId + '.png';
  return minioClient.getObject(process.env.minioBucket, fileName);
}

function initializeMinioClient() {
  let port = null;
  if (process.env.minioPort !== undefined) {
    port = parseInt(process.env.minioPort);
  }
  minioClient = new Minio.Client({
    endPoint: process.env.minioEndPoint,
    port,
    useSSL: process.env.minioUseSSL.toLowerCase() === 'true',
    accessKey: process.env.minioAccessKey,
    secretKey: process.env.minioSecretKey,
  });
}
