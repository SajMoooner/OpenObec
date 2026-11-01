package sk.openobec.files;

public class FileFailure extends RuntimeException {
  private final int status;

  public FileFailure(int status, String message) {
    super(message);
    this.status = status;
  }

  public int status() {
    return status;
  }
}
