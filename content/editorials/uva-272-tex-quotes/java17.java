import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.InputStream;

class Main {
    public static void main(String[] args) throws IOException {
        InputStream input = System.in;
        BufferedOutputStream output = new BufferedOutputStream(System.out);
        boolean opening = true;
        int ch;
        while ((ch = input.read()) != -1) {
            if (ch == '"') {
                output.write(opening ? '`' : '\'');
                output.write(opening ? '`' : '\'');
                opening = !opening;
            } else {
                output.write(ch);
            }
        }
        output.flush();
    }
}
