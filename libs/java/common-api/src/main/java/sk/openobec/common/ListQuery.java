package sk.openobec.common;

import java.util.*;

public record ListQuery(int page, int page_size, String q, String sort, Boolean zverejnene) {
  public static ListQuery parse(Map<String, String> query) {
    if (!Set.of("page", "page_size", "q", "sort", "zverejnene").containsAll(query.keySet()))
      throw bad();
    int page = number(query.getOrDefault("page", "1"), 1, Integer.MAX_VALUE),
        size = number(query.getOrDefault("page_size", "20"), 1, 100);
    String q = query.getOrDefault("q", "");
    String sort = query.getOrDefault("sort", "-created_at");
    if (q.length() > 200
        || !Set.of("created_at", "-created_at", "updated_at", "-updated_at").contains(sort))
      throw bad();
    Boolean published = null;
    if (query.containsKey("zverejnene")) {
      if (!Set.of("true", "false").contains(query.get("zverejnene"))) throw bad();
      published = Boolean.valueOf(query.get("zverejnene"));
    }
    return new ListQuery(page, size, q, sort, published);
  }

  public static int number(String v, int min, int max) {
    try {
      if (!v.matches("[0-9]+")) throw bad();
      int n = Integer.parseInt(v);
      if (n < min || n > max) throw bad();
      return n;
    } catch (NumberFormatException e) {
      throw bad();
    }
  }

  public static Map<String, Object> pagination(long total, int page, int size) {
    return Map.of(
        "page", page, "page_size", size, "total", total, "total_pages", (total + size - 1) / size);
  }

  public static ApiException bad() {
    return new ApiException(400, "BAD_REQUEST", "Neplatné parametre požiadavky.");
  }
}
