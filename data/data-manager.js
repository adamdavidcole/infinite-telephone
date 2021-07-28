import { Low, JSONFile } from "lowdb";
import path, { join } from "path";

const __dirname = path.resolve();

const file = join(__dirname, "data/db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Read data from JSON file, this will set db.data content
export async function initialize() {
  await db.read();
}

export function getData() {
  return db.data;
}

export async function addDataEntry(entry) {
  db.data.push(entry);
  console.log("db.data update", db.data);
  await db.write();
}
