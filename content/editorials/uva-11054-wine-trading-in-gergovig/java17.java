import java.io.BufferedInputStream;
import java.io.IOException;

class Main {
    static final BufferedInputStream input = new BufferedInputStream(System.in);
    static long nextLong() throws IOException {
        int ch;
        do { ch = input.read(); } while (ch <= ' ' && ch != -1);
        if (ch == -1) return -1;
        int sign = 1;
        if (ch == '-') { sign = -1; ch = input.read(); }
        long value = 0;
        while (ch > ' ') { value = value * 10 + ch - '0'; ch = input.read(); }
        return sign * value;
    }
    public static void main(String[] args) throws IOException {
        StringBuilder output = new StringBuilder();
        while (true) {
            int n = (int)nextLong();
            if (n <= 0) break;
            long balance = 0, work = 0;
            for (int i = 0; i < n; ++i) {
                balance += nextLong();
                work += Math.abs(balance);
            }
            output.append(work).append('\n');
        }
        System.out.print(output);
    }
}
