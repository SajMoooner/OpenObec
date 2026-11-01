package sk.openobec.gateway;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.Test;

class WindowLimiterTest {
  @Test
  void independentPeersResetAndMemoryBound() {
    var time = new AtomicLong(1000);
    var limiter = new WindowLimiter(2, 3, time::get);
    assertThat(limiter.retryAfter("a")).isZero();
    assertThat(limiter.retryAfter("a")).isZero();
    assertThat(limiter.retryAfter("a")).isEqualTo(59);
    assertThat(limiter.retryAfter("b")).isZero();
    assertThat(limiter.retryAfter("c")).isZero();
    assertThat(limiter.retryAfter("d")).isZero();
    assertThat(limiter.size()).isEqualTo(3);
    time.set(60_000);
    assertThat(limiter.retryAfter("a")).isZero();
    assertThat(limiter.size()).isEqualTo(3);
  }
}
