package sk.openobec.query;

import static org.junit.jupiter.api.Assertions.*;

import java.time.*;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import sk.openobec.common.ApiException;

class CursorCodecTest {
  @Test
  void verifiedExpiryIs410EvenWithoutDatabaseAndBindingIsChecked() {
    String key = "a-secret-with-at-least-thirty-two-characters";
    Instant now = Instant.parse("2026-11-01T10:00:00Z");
    var codec = new CursorCodec(key, Clock.fixed(now, ZoneOffset.UTC));
    var binding =
        new Document("tenant", "zilina")
            .append("type", "zmluvy")
            .append("root", "a")
            .append("filter", null)
            .append("size", 100);
    var payload =
        new Document(binding)
            .append("snapshot", "already-removed")
            .append("position", 100)
            .append("expires", now.getEpochSecond() - 1)
            .append("format", 1);
    String token = codec.encode(payload);
    assertEquals(
        410, assertThrows(ApiException.class, () -> codec.decode(token, binding)).status());
    assertEquals(
        400, assertThrows(ApiException.class, () -> codec.decode(token + "x", binding)).status());
    var changed = new Document(binding);
    changed.put("tenant", "other");
    assertEquals(
        400, assertThrows(ApiException.class, () -> codec.decode(token, changed)).status());
  }
}
