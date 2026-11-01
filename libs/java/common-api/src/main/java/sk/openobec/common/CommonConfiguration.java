package sk.openobec.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.*;
import org.springframework.core.env.Environment;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.*;
import org.springframework.web.servlet.config.annotation.*;
import sk.openobec.files.S3Storage;

@Configuration
@EnableScheduling
public class CommonConfiguration implements WebMvcConfigurer {
  @Bean
  public ObjectMapper objectMapper() {
    return Json.mapper();
  }

  @Bean(destroyMethod = "close")
  public ReferenceValidator referenceValidator(Environment env) {
    return new ReferenceValidator(
        Map.of(
            "faktury",
            env.getProperty("INVOICES_SERVICE_URL", "http://localhost:8081"),
            "dodavatelske-faktury",
            env.getProperty("SUPPLIER_INVOICES_SERVICE_URL", "http://localhost:8082"),
            "zmluvy",
            env.getProperty("CONTRACTS_SERVICE_URL", "http://localhost:8083"),
            "objednavky",
            env.getProperty("ORDERS_SERVICE_URL", "http://localhost:8084"),
            "verejne-obstaravanie",
            env.getProperty("PROCUREMENT_SERVICE_URL", "http://localhost:8085")));
  }

  @Bean(destroyMethod = "close")
  public S3Storage s3Storage(Environment env) {
    return new S3Storage(
        env.getProperty("S3_ENDPOINT", "http://localhost:9000"),
        env.getProperty("S3_ACCESS_KEY", "openobec-demo"),
        env.getProperty("S3_SECRET_KEY", "openobec-local-demo-secret"),
        env.getProperty("S3_BUCKET", "openobec-documents"));
  }

  @Bean
  public AttachmentStore attachmentStore(RecordStore store, S3Storage storage) {
    return new AttachmentStore(store, storage);
  }

  @Bean
  public OutboxPublisher outboxPublisher(
      RecordStore store, KafkaTemplate<String, String> kafka, Environment environment) {
    return new OutboxPublisher(
        store,
        kafka,
        environment.getProperty("openobec.events.topic", sk.openobec.events.DocumentEvent.TOPIC));
  }

  @Bean
  @ConditionalOnProperty(
      name = "openobec.outbox.enabled",
      havingValue = "true",
      matchIfMissing = true)
  public PublisherSchedule publisherSchedule(OutboxPublisher publisher) {
    return new PublisherSchedule(publisher);
  }

  public static class PublisherSchedule {
    private final OutboxPublisher publisher;

    PublisherSchedule(OutboxPublisher p) {
      publisher = p;
    }

    @Scheduled(fixedDelayString = "${openobec.outbox.delay-ms:1000}")
    public void publish() {
      publisher.publishAvailable();
    }
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry
        .addInterceptor(new RequestDiagnosticsInterceptor())
        .addPathPatterns("/rest/**", "/internal/**");
  }
}
