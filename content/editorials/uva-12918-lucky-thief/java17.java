import java.io.BufferedInputStream;
import java.io.IOException;

class Main {
    static final BufferedInputStream input = new BufferedInputStream(System.in);
    static long nextLong() throws IOException {
        int ch;
        do { ch = input.read(); } while (ch <= ' ' && ch != -1);
        long value = 0;
        while (ch > ' ') {
            value = value * 10 + ch - '0';
            ch = input.read();
        }
        return value;
    }
    public static void main(String[] args) throws IOException {
        int tests = (int)nextLong();
        StringBuilder output = new StringBuilder();
        for (int i = 0; i < tests; ++i) {
            long keys = nextLong(), doors = nextLong();
            long answer = keys * (2 * doors - keys - 1) / 2;
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
