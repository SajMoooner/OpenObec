package sk.openobec.common;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/** Concrete controller supplies the agenda route and concrete domain repository. */
public abstract class DomainController {
  protected final RecordStore store;
  private final AttachmentStore attachments;

  protected DomainController(RecordStore store, AttachmentStore attachments) {
    this.store = store;
    this.attachments = attachments;
  }

  public static ObjectNode object(JsonNode n) {
    if (!(n instanceof ObjectNode))
      throw ApiException.validation("body", "INVALID_TYPE", "Telo musí byť JSON objekt.");
    return (ObjectNode) n;
  }

  public static Map<String, String> parameters(MultiValueMap<String, String> params) {
    Map<String, String> result = new HashMap<>();
    params.forEach(
        (key, values) -> {
          if (values.size() != 1) throw ListQuery.bad();
          result.put(key, values.getFirst());
        });
    return result;
  }

  @GetMapping
  public Map<String, Object> list(@RequestParam MultiValueMap<String, String> params) {
    return store.list(ListQuery.parse(parameters(params)));
  }

  @GetMapping("/{id}")
  public Map<String, Object> detail(@PathVariable String id) {
    return Map.of("data", store.detail(id));
  }

  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> create(@RequestBody JsonNode input) {
    ObjectNode result = store.create(object(input));
    return ResponseEntity.created(
            URI.create(
                "/rest/v1/" + store.definition().agenda() + "/" + result.path("id").asText()))
        .body(Map.of("data", result));
  }

  @PostMapping(value = "/{id}/update", consumes = MediaType.APPLICATION_JSON_VALUE)
  public Map<String, Object> update(@PathVariable String id, @RequestBody JsonNode input) {
    return Map.of("data", store.update(id, object(input)));
  }

  @PostMapping("/{id}/delete")
  public Map<String, Object> delete(@PathVariable String id) {
    return Map.of("data", store.delete(id));
  }

  @GetMapping("/{id}/prilohy")
  public Map<String, Object> attachments(@PathVariable String id) {
    return Map.of("data", attachments.list(id));
  }

  @PostMapping(value = "/{id}/prilohy", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<?> upload(
      @PathVariable String id, @RequestPart("file") MultipartFile file) {
    return ResponseEntity.status(201).body(Map.of("data", attachments.upload(id, file)));
  }

  @GetMapping("/{id}/prilohy/{file_id}/download")
  public ResponseEntity<InputStreamResource> download(
      @PathVariable String id, @PathVariable String file_id) {
    var download = attachments.download(id, file_id);
    var metadata = download.metadata();
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(metadata.getString("content_type")))
        .contentLength(((Number) metadata.get("size_bytes")).longValue())
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment()
                .filename(metadata.getString("filename"), StandardCharsets.UTF_8)
                .build()
                .toString())
        .header("X-Content-Type-Options", "nosniff")
        .body(new InputStreamResource(download.stream()));
  }

  @PostMapping("/{id}/prilohy/{file_id}/delete")
  public Map<String, Object> deleteAttachment(
      @PathVariable String id, @PathVariable String file_id) {
    return Map.of("data", attachments.delete(id, file_id));
  }
}
