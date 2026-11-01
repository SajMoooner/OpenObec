package sk.openobec.pairing;

import java.util.*;
import java.util.concurrent.atomic.*;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.boot.actuate.health.*;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import sk.openobec.common.Json;
import sk.openobec.read.ProjectionEngine;

@Component
public final class PairingListener implements HealthIndicator {
  private final ProjectionEngine engine;
  private final AtomicLong processed = new AtomicLong(),
      retries = new AtomicLong(),
      dlq = new AtomicLong();
  private volatile boolean available = true;
  private volatile String lastError = "";

  public PairingListener(ProjectionEngine engine) {
    this.engine = engine;
  }

  public static final class InvalidEvent extends RuntimeException {
    InvalidEvent(Throwable cause) {
      super("Invalid v1 document snapshot", cause);
    }
  }

  @KafkaListener(
      id = "pairing",
      topics = "${openobec.events.topic}",
      groupId = "${openobec.pairing.group}",
      autoStartup = "${openobec.pairing.enabled:true}")
  public void receive(ConsumerRecord<String, String> record, Acknowledgment ack) {
    try {
      com.fasterxml.jackson.databind.JsonNode raw;
      try {
        raw = Json.mapper().readTree(record.value());
        if (raw == null) throw new IllegalArgumentException("Empty event");
      } catch (Exception ex) {
        throw new InvalidEvent(ex);
      }
      try {
        engine.applyActive(raw);
      } catch (IllegalArgumentException ex) {
        throw new InvalidEvent(ex);
      }
      ack.acknowledge();
      processed.incrementAndGet();
      available = true;
      lastError = "";
    } catch (RuntimeException ex) {
      lastError = ex.getClass().getSimpleName();
      throw ex;
    }
  }

  public void failed(Exception ex) {
    retries.incrementAndGet();
    lastError = ex.getClass().getSimpleName();
    if (!invalid(ex)) available = false;
  }

  public void deadLetterConfirmed() {
    dlq.incrementAndGet();
    available = true;
  }

  static boolean invalid(Throwable e) {
    for (Throwable p = e; p != null; p = p.getCause()) if (p instanceof InvalidEvent) return true;
    return false;
  }

  public Map<String, Long> status() {
    return Map.of("processed", processed.get(), "retries", retries.get(), "dlq", dlq.get());
  }

  @Override
  public Health health() {
    return (available ? Health.up() : Health.down())
        .withDetails(status())
        .withDetail("last_error", lastError)
        .build();
  }
}
