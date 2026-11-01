package sk.openobec.files;

import java.net.URI;
import java.nio.file.Path;
import java.time.Duration;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.*;
import software.amazon.awssdk.services.s3.model.*;

public class S3Storage implements AutoCloseable {
  private final S3Client client;
  private final String bucket;

  public S3Storage(String endpoint, String access, String secret, String bucket) {
    this.bucket = bucket;
    client =
        S3Client.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.US_EAST_1)
            .credentialsProvider(
                StaticCredentialsProvider.create(AwsBasicCredentials.create(access, secret)))
            .forcePathStyle(true)
            .overrideConfiguration(
                c ->
                    c.apiCallTimeout(Duration.ofSeconds(30))
                        .apiCallAttemptTimeout(Duration.ofSeconds(15)))
            .build();
  }

  public void put(String key, String type, Path file) {
    try {
      client.putObject(
          PutObjectRequest.builder().bucket(bucket).key(key).contentType(type).build(),
          RequestBody.fromFile(file));
    } catch (Exception e) {
      throw new FileFailure(503, "Úložisko príloh je nedostupné.");
    }
  }

  public ResponseInputStream<GetObjectResponse> get(String key) {
    try {
      return client.getObject(GetObjectRequest.builder().bucket(bucket).key(key).build());
    } catch (Exception e) {
      throw new FileFailure(503, "Úložisko príloh je nedostupné.");
    }
  }

  public void remove(String key) {
    try {
      client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    } catch (Exception e) {
      throw new FileFailure(503, "Kompenzačné odstránenie objektu zlyhalo.");
    }
  }

  @Override
  public void close() {
    client.close();
  }
}
