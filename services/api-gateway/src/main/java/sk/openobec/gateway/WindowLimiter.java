package sk.openobec.gateway;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.LongSupplier;

/** One bounded bucket per direct peer. Forwarded headers never change the key. */
final class WindowLimiter {
  private record Bucket(long window, int used) {}

  private final Map<String, Bucket> buckets = new LinkedHashMap<>(64, .75f, true);
  private final int limit;
  private final int capacity;
  private final LongSupplier clock;

  WindowLimiter(int limit, int capacity, LongSupplier clock) {
    if (limit < 1 || capacity < 1)
      throw new IllegalArgumentException("Invalid rate limiter configuration");
    this.limit = limit;
    this.capacity = capacity;
    this.clock = clock;
  }

  synchronized long retryAfter(String peer) {
    long now = clock.getAsLong();
    long window = now / 60_000;
    Bucket old = buckets.get(peer);
    int used = old != null && old.window == window ? old.used : 0;
    if (used >= limit) return Math.max(1, (60_000 - now % 60_000 + 999) / 1_000);
    if (!buckets.containsKey(peer) && buckets.size() >= capacity)
      buckets.remove(buckets.keySet().iterator().next());
    buckets.put(peer, new Bucket(window, used + 1));
    return 0;
  }

  synchronized int size() {
    return buckets.size();
  }
}
