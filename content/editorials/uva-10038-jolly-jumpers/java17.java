import java.io.BufferedInputStream;
class Main {
    static final BufferedInputStream input = new BufferedInputStream(System.in);
    static int read() throws Exception {
        int ch;
        do { ch = input.read(); } while (ch <= 32 && ch != -1);
        if (ch == -1) return Integer.MIN_VALUE;
        int sign = 1;
        if (ch == '-') { sign = -1; ch = input.read(); }
        int value = 0;
        while (ch > 32 && ch != -1) { value = value * 10 + ch - '0'; ch = input.read(); }
        return sign * value;
    }
    public static void main(String[] args) throws Exception {
        StringBuilder output = new StringBuilder();
        int n;
        while ((n = read()) != Integer.MIN_VALUE) {
            boolean[] seen = new boolean[n];
            int previous = read();
            boolean good = true;
            for (int i = 1; i < n; ++i) {
                int current = read();
                long difference = Math.abs((long) current - previous);
                if (difference < 1 || difference >= n || seen[(int) difference]) good = false;
                else seen[(int) difference] = true;
                previous = current;
            }
            output.append(good ? "Jolly\n" : "Not jolly\n");
        }
        System.out.print(output);
    }
}
