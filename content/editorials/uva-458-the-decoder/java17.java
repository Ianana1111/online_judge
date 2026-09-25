import java.io.BufferedOutputStream;
import java.io.IOException;

class Main {
    public static void main(String[] args) throws IOException {
        BufferedOutputStream output = new BufferedOutputStream(System.out);
        int ch;
        while ((ch = System.in.read()) != -1) {
            if (ch == '\n' || ch == '\r') {
                output.write(ch);
            } else {
                int decoded = ch - 7;
                if (decoded < 32) decoded += 95;
                output.write(decoded);
            }
        }
        output.flush();
    }
}
