package sk.openobec.pairing;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeUnit;
import org.springframework.context.annotation.*;
import org.springframework.core.env.Environment;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.listener.*;
import org.springframework.util.backoff.FixedBackOff;
import sk.openobec.common.Json;

@Configuration
public class KafkaConfiguration {
  @Bean
  ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory(
      Environment env, KafkaTemplate<String, String> producer, PairingListener listener) {
    var factory = new ConcurrentKafkaListenerContainerFactory<String, String>();
    factory.setConsumerFactory(
        new DefaultKafkaConsumerFactory<>(
            Map.of(
                "bootstrap.servers",
                env.getProperty("spring.kafka.bootstrap-servers", "localhost:9092"),
                "key.deserializer",
                "org.apache.kafka.common.serialization.StringDeserializer",
                "value.deserializer",
                "org.apache.kafka.common.serialization.StringDeserializer",
                "enable.auto.commit",
                false,
                "auto.offset.reset",
                "earliest",
                "max.poll.records",
                20)));
    factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
    factory.setConcurrency(1);
    var handler =
        new DefaultErrorHandler(
            (record, ex) -> {
              if (!PairingListener.invalid(ex))
                throw new IllegalStateException("Infrastructure failures must be retried", ex);
              try {
                var message = Json.mapper().createObjectNode();
                message
                    .put("raw", Objects.toString(record.value(), ""))
                    .put("source_topic", record.topic())
                    .put("source_partition", record.partition())
                    .put("source_offset", record.offset())
                    .put("source_key", Objects.toString(record.key(), ""))
                    .put("error", "INVALID_DOCUMENT_EVENT")
                    .put("failed_at", Instant.now().toString());
                producer
                    .send(
                        env.getRequiredProperty("openobec.events.dlq"),
                        Objects.toString(record.key(), ""),
                        message.toString())
                    .get(10, TimeUnit.SECONDS);
                listener.deadLetterConfirmed();
              } catch (Exception failed) {
                if (failed instanceof InterruptedException) Thread.currentThread().interrupt();
                listener.failed(failed);
                throw new IllegalStateException(
                    "DLQ was not confirmed; source offset retained", failed);
              }
            },
            new FixedBackOff(1000, FixedBackOff.UNLIMITED_ATTEMPTS));
    handler.setBackOffFunction(
        (r, e) ->
            PairingListener.invalid(e)
                ? new FixedBackOff(250, 2)
                : new FixedBackOff(1000, FixedBackOff.UNLIMITED_ATTEMPTS));
    handler.setCommitRecovered(true);
    handler.setRetryListeners((record, ex, attempt) -> listener.failed(ex));
    factory.setCommonErrorHandler(handler);
    return factory;
  }
}
