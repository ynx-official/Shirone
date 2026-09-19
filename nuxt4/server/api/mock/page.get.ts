import { pageData } from "../../services/content";
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return pageData(String(query.path || "/"), query);
});
