import java.io.BufferedInputStream;
import java.io.IOException;

class Main {
    static final BufferedInputStream input = new BufferedInputStream(System.in);
    static long nextLong() throws IOException {
        int ch;
        do { ch = input.read(); } while (ch <= ' ' && ch != -1);
        if (ch == -1) return -1;
        long value = 0;
        while (ch > ' ') {
            value = value * 10 + ch - '0';
            ch = input.read();
        }
        return value;
    }
    public static void main(String[] args) throws IOException {
        StringBuilder output = new StringBuilder();
        while (true) {
            long low = nextLong();
            if (low == -1) break;
            long high = nextLong();
            if (low == 0 && high == 0) break;
            output.append(high / 5 - low / 5 + 1).append('\n');
        }
        System.out.print(output);
    }
}
