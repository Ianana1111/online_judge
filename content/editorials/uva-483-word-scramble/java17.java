import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

class Main {
    static void flushWord(ByteArrayOutputStream word, BufferedOutputStream output) throws IOException {
        byte[] bytes = word.toByteArray();
        for (int i = bytes.length - 1; i >= 0; --i) output.write(bytes[i]);
        word.reset();
    }
    public static void main(String[] args) throws IOException {
        ByteArrayOutputStream word = new ByteArrayOutputStream();
        BufferedOutputStream output = new BufferedOutputStream(System.out);
        int ch;
        while ((ch = System.in.read()) != -1) {
            if (ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r' || ch == '\f' || ch == 11) {
                flushWord(word, output);
                output.write(ch);
            } else {
                word.write(ch);
            }
        }
        flushWord(word, output);
        output.flush();
    }
}
