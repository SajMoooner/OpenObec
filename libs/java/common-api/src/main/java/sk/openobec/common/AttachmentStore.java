package sk.openobec.common;

import static com.mongodb.client.model.Filters.*;

import com.mongodb.client.model.*;
import java.io.*;
import java.nio.file.*;
import java.security.*;
import java.time.Instant;
import java.util.*;
import org.bson.Document;
import org.springframework.web.multipart.MultipartFile;
import sk.openobec.files.*;

public class AttachmentStore {
  private final RecordStore store;
  private final S3Storage storage;

  public AttachmentStore(RecordStore store, S3Storage storage) {
    this.store = store;
    this.storage = storage;
  }

  private Document publicMetadata(Document d) {
    Document n = new Document();
    for (String field :
        List.of("id", "filename", "content_type", "size_bytes", "sha256", "created_at"))
      n.put(field, d.get(field));
    return n;
  }

  private org.bson.conversions.Bson owned(String id, String fid) {
    return and(eq("obec_id", "zilina"), eq("document_id", id), eq("id", fid), eq("deleted", false));
  }

  public List<Document> list(String id) {
    store.active(id);
    List<Document> data = new ArrayList<>();
    store
        .database()
        .getCollection("attachments")
        .find(and(eq("obec_id", "zilina"), eq("document_id", id), eq("deleted", false)))
        .sort(Sorts.orderBy(Sorts.ascending("created_at"), Sorts.ascending("id")))
        .forEach(d -> data.add(publicMetadata(d)));
    return data;
  }

  public Document upload(String id, MultipartFile file) {
    store.active(id);
    String filename = FileValidation.filename(file.getOriginalFilename()),
        type = file.getContentType();
    if (file.getSize() > FileValidation.MAX_SIZE)
      throw new FileFailure(413, "Príloha presahuje 20 MiB.");
    Path temp = null;
    try {
      temp = Files.createTempFile("openobec-upload-", ".tmp");
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      long size = 0;
      byte[] first = new byte[8];
      int firstCount = 0;
      try (InputStream in = file.getInputStream();
          OutputStream out = Files.newOutputStream(temp)) {
        byte[] buffer = new byte[64 * 1024];
        int n;
        while ((n = in.read(buffer)) != -1) {
          size += n;
          if (size > FileValidation.MAX_SIZE)
            throw new FileFailure(413, "Príloha presahuje 20 MiB.");
          if (firstCount < 8) {
            int count = Math.min(8 - firstCount, n);
            System.arraycopy(buffer, 0, first, firstCount, count);
            firstCount += count;
          }
          digest.update(buffer, 0, n);
          out.write(buffer, 0, n);
        }
      }
      FileValidation.signature(type, Arrays.copyOf(first, firstCount), size);
      String fid = "file_" + UUID.randomUUID();
      String key =
          "zilina/" + store.definition().agenda() + "/" + id + "/" + fid + "/" + UUID.randomUUID();
      Document metadata =
          new Document("_id", fid)
              .append("id", fid)
              .append("obec_id", "zilina")
              .append("document_id", id)
              .append("filename", filename)
              .append("content_type", type)
              .append("size_bytes", size)
              .append("sha256", HexFormat.of().formatHex(digest.digest()))
              .append("created_at", Instant.now().toString())
              .append("object_key", key)
              .append("deleted", false)
              .append("deleted_at", null);
      storage.put(key, type, temp);
      try {
        return store.transaction(
            s -> {
              store.active(s, id);
              store
                  .database()
                  .getCollection("documents")
                  .updateOne(s, store.activeFilter(id), Updates.inc("_attachment_epoch", 1L));
              long count =
                  store
                      .database()
                      .getCollection("attachments")
                      .countDocuments(
                          s,
                          and(
                              eq("obec_id", "zilina"),
                              eq("document_id", id),
                              eq("deleted", false)));
              if (count >= 10)
                throw ApiException.validation(
                    "file", "INVALID_VALUE", "Záznam môže mať najviac 10 aktívnych príloh.");
              store.database().getCollection("attachments").insertOne(s, metadata);
              return publicMetadata(metadata);
            });
      } catch (RuntimeException failure) {
        try {
          storage.remove(key);
        } catch (Exception cleanup) {
          store
              .database()
              .getCollection("storage_cleanup")
              .insertOne(
                  new Document("_id", UUID.randomUUID().toString())
                      .append("object_key", key)
                      .append("created_at", Date.from(Instant.now()))
                      .append("reason", "upload_metadata_failed"));
          failure.addSuppressed(cleanup);
        }
        throw failure;
      }
    } catch (FileFailure | ApiException e) {
      throw e;
    } catch (IOException e) {
      throw new FileFailure(503, "Prílohu sa nepodarilo načítať.");
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    } finally {
      if (temp != null)
        try {
          Files.deleteIfExists(temp);
        } catch (IOException ignored) {
        }
    }
  }

  public Download download(String id, String fid) {
    store.active(id);
    Document d = store.database().getCollection("attachments").find(owned(id, fid)).first();
    if (d == null) throw ApiException.notFound();
    return new Download(publicMetadata(d), storage.get(d.getString("object_key")));
  }

  public Map<String, Object> delete(String id, String fid) {
    return store.transaction(
        s -> {
          store.active(s, id);
          store
              .database()
              .getCollection("documents")
              .updateOne(s, store.activeFilter(id), Updates.inc("_attachment_epoch", 1L));
          String now = Instant.now().toString();
          var result =
              store
                  .database()
                  .getCollection("attachments")
                  .updateOne(
                      s,
                      owned(id, fid),
                      Updates.combine(
                          Updates.set("deleted", true), Updates.set("deleted_at", now)));
          if (result.getMatchedCount() != 1) throw ApiException.notFound();
          return Map.of("id", fid, "deleted", true, "deleted_at", now);
        });
  }

  public record Download(Document metadata, InputStream stream) {}
}
