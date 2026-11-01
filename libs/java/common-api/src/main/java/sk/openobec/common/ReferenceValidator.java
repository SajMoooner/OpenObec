package sk.openobec.common;

import com.fasterxml.jackson.databind.*;
import java.net.*;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

/** Only authoritative owner detail HTTP is used. Eight outstanding requests per service. */
public class ReferenceValidator implements AutoCloseable {
  private final Map<String, String> owners;
  private final HttpClient client;
  private final ExecutorService pool = Executors.newFixedThreadPool(8);
  private final Semaphore concurrency = new Semaphore(8);

  public ReferenceValidator(Map<String, String> owners) {
    this.owners = Map.copyOf(owners);
    client = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(600)).build();
  }

  public void validate(JsonNode next, JsonNode previous) {
    Set<String> old = new HashSet<>();
    if (previous != null)
      for (JsonNode r : previous) old.add(r.path("typ").asText() + "\0" + r.path("id").asText());
    List<Callable<Void>> work = new ArrayList<>();
    for (JsonNode r : next) {
      String type = r.path("typ").asText(), id = r.path("id").asText();
      if (!old.contains(type + "\0" + id))
        work.add(
            () -> {
              check(type, id);
              return null;
            });
    }
    try {
      for (Future<Void> f : pool.invokeAll(work, 20, TimeUnit.SECONDS)) {
        try {
          f.get();
        } catch (ExecutionException e) {
          if (e.getCause() instanceof ApiException a) throw a;
          throw unavailable();
        } catch (CancellationException e) {
          throw unavailable();
        }
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw unavailable();
    }
  }

  private void check(String type, String id) {
    boolean acquired = false;
    try {
      acquired = concurrency.tryAcquire(3, TimeUnit.SECONDS);
      if (!acquired) throw unavailable();
      String base = owners.get(type);
      if (base == null) throw invalid();
      String encoded =
          URLEncoder.encode(id, java.nio.charset.StandardCharsets.UTF_8).replace("+", "%20");
      var response =
          client.send(
              HttpRequest.newBuilder(URI.create(base + "/rest/v1/" + type + "/" + encoded))
                  .timeout(Duration.ofMillis(1000))
                  .header("X-Obec-Id", "zilina")
                  .GET()
                  .build(),
              HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() == 404) throw invalid();
      if (response.statusCode() != 200) throw unavailable();
      var data = Json.mapper().readTree(response.body()).path("data");
      if (!id.equals(data.path("id").asText()) || !"zilina".equals(data.path("obec_id").asText()))
        throw invalid();
    } catch (ApiException e) {
      throw e;
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw unavailable();
    } catch (Exception e) {
      throw unavailable();
    } finally {
      if (acquired) concurrency.release();
    }
  }

  private ApiException invalid() {
    return ApiException.validation(
        "suvisiace_zaznamy", "INVALID_REFERENCE", "Odkazovaný záznam neexistuje v obci.");
  }

  private ApiException unavailable() {
    return new ApiException(
        503, "DEPENDENCY_UNAVAILABLE", "Vlastník odkazovaného záznamu je nedostupný.");
  }

  @Override
  public void close() {
    pool.shutdownNow();
  }
}
