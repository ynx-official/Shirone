import { database } from "../../services/content";
export default defineEventHandler(async () => (await database()).site);
