package sk.openobec.files;

import java.util.Arrays;

public final class FileValidation {
  public static final long MAX_SIZE = 20L * 1024 * 1024;

  private FileValidation() {}

  public static String filename(String name) {
    if (name == null
        || name.isBlank()
        || name.length() > 500
        || name.equals(".")
        || name.equals("..")
        || name.contains("/")
        || name.contains("\\")
        || name.chars().anyMatch(c -> Character.isISOControl(c)))
      throw new FileFailure(422, "Neplatný názov súboru.");
    return name;
  }

  public static void signature(String type, byte[] bytes, long size) {
    if (size > MAX_SIZE) throw new FileFailure(413, "Príloha presahuje 20 MiB.");
    if (size < 1) throw new FileFailure(415, "Prázdna príloha.");
    byte[] prefix =
        switch (type == null ? "" : type) {
          case "application/pdf" -> new byte[] {37, 80, 68, 70, 45};
          case "image/png" -> new byte[] {(byte) 137, 80, 78, 71, 13, 10, 26, 10};
          case "image/jpeg" -> new byte[] {(byte) 255, (byte) 216, (byte) 255};
          default -> throw new FileFailure(415, "Podporované sú PDF, PNG a JPEG.");
        };
    if (bytes.length < prefix.length || !Arrays.equals(prefix, Arrays.copyOf(bytes, prefix.length)))
      throw new FileFailure(415, "Podpis súboru nezodpovedá MIME typu.");
  }
}
