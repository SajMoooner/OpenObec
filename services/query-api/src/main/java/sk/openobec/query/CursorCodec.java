package sk.openobec.query;

import com.fasterxml.jackson.databind.JsonNode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.bson.Document;
import sk.openobec.common.*;

/** Signature verified before expiry, including when Mongo TTL already removed the snapshot. */
public final class CursorCodec {
  private final byte[] secret;
  private final Clock clock;

  public CursorCodec(String secret, Clock clock) {
    if (secret == null || secret.length() < 32)
      throw new IllegalArgumentException("QUERY_CURSOR_SECRET must contain at least 32 characters");
    this.secret = secret.getBytes(StandardCharsets.UTF_8);
    this.clock = clock;
  }

  private byte[] hmac(byte[] value) {
    try {
      Mac m = Mac.getInstance("HmacSHA256");
      m.init(new SecretKeySpec(secret, "HmacSHA256"));
      return m.doFinal(value);
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }

  public String encode(Document payload) {
    byte[] body = payload.toJson().getBytes(StandardCharsets.UTF_8);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(body)
        + "."
        + Base64.getUrlEncoder().withoutPadding().encodeToString(hmac(body));
  }

  public Document decode(String value, Document binding) {
    try {
      if (value.length() > 8192) throw ListQuery.bad();
      String[] parts = value.split("\\.", -1);
      if (parts.length != 2) throw ListQuery.bad();
      byte[] bytes = Base64.getUrlDecoder().decode(parts[0]);
      byte[] signature = Base64.getUrlDecoder().decode(parts[1]);
      if (!MessageDigest.isEqual(signature, hmac(bytes))) throw ListQuery.bad();
      JsonNode n = Json.mapper().readTree(bytes);
      if (!n.isObject()
          || n.size() != binding.size() + 4
          || !n.path("snapshot").isTextual()
          || !n.path("position").isIntegralNumber()
          || !n.path("expires").isIntegralNumber()
          || !n.path("format").isInt()
          || n.path("format").asInt() != 1) throw ListQuery.bad();
      Document p = Document.parse(new String(bytes, StandardCharsets.UTF_8));
      for (var entry : binding.entrySet())
        if (!java.util.Objects.equals(p.get(entry.getKey()), entry.getValue()))
          throw ListQuery.bad();
      if (n.path("position").asLong() < 0 || n.path("position").asLong() > Integer.MAX_VALUE)
        throw ListQuery.bad();
      if (n.path("expires").asLong() <= clock.instant().getEpochSecond()) throw expired();
      return p;
    } catch (ApiException e) {
      throw e;
    } catch (Exception e) {
      throw ListQuery.bad();
    }
  }

  public static ApiException expired() {
    return new ApiException(
        410, "CURSOR_EXPIRED", "Platnosť prehľadu uplynula. Načítajte ho znova.");
  }
}
