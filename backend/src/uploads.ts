import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { prisma } from './db';
import { config } from './config';

const hasS3Config =
  Boolean(config.s3.bucket) &&
  Boolean(config.s3.region) &&
  Boolean(config.s3.accessKeyId) &&
  Boolean(config.s3.secretAccessKey);

const getS3Client = () =>
  new S3Client({
    region: config.s3.region,
    endpoint: config.s3.endpoint || undefined,
    credentials: {
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
    },
    forcePathStyle: Boolean(config.s3.endpoint),
  });

const getLocalUploadsRoot = () => path.resolve(process.cwd(), 'backend', 'uploads');

const uploadBufferLocally = async (file: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  altAr?: string;
  altEn?: string;
}) => {
  const fileExtension = file.originalName.includes('.') ? file.originalName.split('.').pop() : 'bin';
  const relativeKey = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomBytes(12).toString('hex')}.${fileExtension}`;
  const absolutePath = path.join(getLocalUploadsRoot(), relativeKey.replace(/^uploads[\\/]/, ''));

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, file.buffer);

  return prisma.asset.create({
    data: {
      key: relativeKey,
      url: `/uploads/${relativeKey.replace(/^uploads[\\/]/, '')}`,
      mimeType: file.mimeType,
      size: file.size,
      originalName: file.originalName,
      altAr: file.altAr,
      altEn: file.altEn,
    },
  });
};

export const uploadBufferToS3 = async (file: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  altAr?: string;
  altEn?: string;
}) => {
  if (!hasS3Config) {
    return uploadBufferLocally(file);
  }

  const fileExtension = file.originalName.includes('.') ? file.originalName.split('.').pop() : 'bin';
  const key = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomBytes(12).toString('hex')}.${fileExtension}`;
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimeType,
      ACL: 'public-read',
    }),
  );

  const url = config.s3.publicBaseUrl
    ? `${config.s3.publicBaseUrl.replace(/\/+$/, '')}/${key}`
    : config.s3.endpoint
      ? `${config.s3.endpoint.replace(/\/+$/, '')}/${config.s3.bucket}/${key}`
      : `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${key}`;

  return prisma.asset.create({
    data: {
      key,
      url,
      mimeType: file.mimeType,
      size: file.size,
      originalName: file.originalName,
      altAr: file.altAr,
      altEn: file.altEn,
    },
  });
};
