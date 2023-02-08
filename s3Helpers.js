import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { S3, GetObjectCommand, PutObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";

const Region = "";
const IdentityPoolId = "";
const BucketName = "";

const s3 = new S3({
  region: Region,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: Region },
    identityPoolId: IdentityPoolId,
  })
});


export async function getObjectFromS3(key) {
  const { Body } = await s3.send(new GetObjectCommand({
    Bucket: BucketName,
    Key: key
  }));
  return decodeReadStreamFromS3(Body);
}

export async function putObjectInS3(key, objectAsString) {
  return s3.send(new PutObjectCommand({
    Bucket: BucketName,
    Key: key,
    Body: objectAsString
  }));
}

export async function listObjectInS3(keyPrefix) {
  const { Contents } = await s3.send(new ListObjectsCommand({
    Bucket: BucketName,
    Prefix: keyPrefix,
  }));
  return Contents.map(file => file.Key);
}

async function decodeReadStreamFromS3(body) {
  const reader = await body.getReader();

  return new Promise((resolve, reject) => {
    let str = "";
    
    try {
      reader.read().then(function processChunks({ done, value }) {
        if (done) {
          resolve(str);
        }
        else {
          str += new TextDecoder("utf-8").decode(value);
          reader.read().then(processChunks);
        }
      });
    } catch (error) {
      reject(error);
    }
  })
}
