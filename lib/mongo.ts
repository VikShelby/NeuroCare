import { MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI as string;
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise as Promise<MongoClient>;
  } else {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
} else {
  console.warn("[auth] MONGODB_URI not set; adapter disabled until provided.");
  clientPromise = new Promise<MongoClient>(() => { /* pending until env provided */ });
}

export default clientPromise;
