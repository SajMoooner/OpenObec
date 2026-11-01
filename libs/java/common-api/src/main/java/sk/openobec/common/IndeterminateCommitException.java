package sk.openobec.common;

/** Commit was sent but its acknowledgement could not establish the final outcome. */
public final class IndeterminateCommitException extends ApiException {
  public IndeterminateCommitException(Throwable cause) {
    super(503, "DEPENDENCY_UNAVAILABLE", "Výsledok uloženia sa zatiaľ nepodarilo overiť.");
    initCause(cause);
  }
}
