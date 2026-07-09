import { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import type { Readable } from "node:stream";

export interface TestDataStoreConfig {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string;
}

export function configFromEnv(): TestDataStoreConfig {
  return {
    endpoint: process.env.MINIO_ENDPOINT ?? "http://localhost:9000",
    accessKeyId: process.env.MINIO_ROOT_USER ?? "oj_minio",
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD ?? "oj_minio_password",
    bucket: process.env.MINIO_BUCKET ?? "oj-testdata",
    region: "us-east-1",
  };
}

/** Thin wrapper around an S3-compatible (MinIO) bucket used to store problem test data. */
export class TestDataStore {
  private client: S3Client;
  private bucket: string;

  constructor(cfg: TestDataStoreConfig = configFromEnv()) {
    this.bucket = cfg.bucket;
    this.client = new S3Client({
      endpoint: cfg.endpoint,
      region: cfg.region ?? "us-east-1",
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
      forcePathStyle: true, // required for MinIO
    });
  }

  async ensureBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  async putText(key: string, body: string): Promise<void> {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body }));
  }

  async getText(key: string): Promise<string> {
    const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    return streamToString(res.Body as Readable);
  }
}

function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}
