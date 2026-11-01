package sk.openobec.files;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class FileValidationTest {
  @Test
  void detectsMimeSignatureMismatch() {
    assertThrows(
        FileFailure.class, () -> FileValidation.signature("image/png", "%PDF-1.7".getBytes(), 8));
  }

  @Test
  void supportsOnlyThreeSignatures() {
    assertDoesNotThrow(() -> FileValidation.signature("application/pdf", "%PDF-1.7".getBytes(), 8));
    assertDoesNotThrow(
        () ->
            FileValidation.signature(
                "image/png", new byte[] {(byte) 137, 80, 78, 71, 13, 10, 26, 10}, 8));
    assertDoesNotThrow(
        () ->
            FileValidation.signature(
                "image/jpeg", new byte[] {(byte) 255, (byte) 216, (byte) 255}, 3));
    assertThrows(
        FileFailure.class, () -> FileValidation.signature("text/plain", "test".getBytes(), 4));
  }

  @Test
  void enforcesSize() {
    assertThrows(
        FileFailure.class,
        () -> FileValidation.signature("application/pdf", "%PDF-1.7".getBytes(), 20971521));
    assertThrows(
        FileFailure.class, () -> FileValidation.signature("application/pdf", new byte[0], 0));
  }

  @Test
  void rejectsPathsAndHeaderInjection() {
    for (String name :
        new String[] {"../x.pdf", "a\\b.pdf", "a/b.pdf", "x\r\nBad: yes", "\u0000.pdf", "", ".."})
      assertThrows(FileFailure.class, () -> FileValidation.filename(name));
    assertEquals("Mestská zmluva.pdf", FileValidation.filename("Mestská zmluva.pdf"));
  }
}
