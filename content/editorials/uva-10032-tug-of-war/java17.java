import java.io.BufferedInputStream;
import java.io.IOException;
import java.math.BigInteger;

class Main {
    private static final BufferedInputStream IN = new BufferedInputStream(System.in);
    private static int nextInt() throws IOException {
        int c;
        do { c = IN.read(); } while (c <= ' ' && c != -1);
        int value = 0;
        while (c > ' ') {
            value = value * 10 + c - '0';
            c = IN.read();
        }
        return value;
    }

    public static void main(String[] args) throws Exception {
        int tests = nextInt();
        StringBuilder answer = new StringBuilder();
        for (int tc = 0; tc < tests; tc++) {
            int n = nextInt();
            int[] weights = new int[n];
            int total = 0;
            for (int i = 0; i < n; i++) {
                weights[i] = nextInt();
                total += weights[i];
            }
            int teamSize = n / 2;
            BigInteger[] possible = new BigInteger[teamSize + 1];
            for (int i = 0; i <= teamSize; i++) possible[i] = BigInteger.ZERO;
            possible[0] = BigInteger.ONE;
            for (int seen = 1; seen <= n; seen++) {
                int weight = weights[seen - 1];
                for (int count = Math.min(seen, teamSize); count >= 1; count--)
                    possible[count] = possible[count].or(possible[count - 1].shiftLeft(weight));
            }
            int best = total + 1, low = 0;
            for (int weight = 0; weight <= total; weight++) {
                if (!possible[teamSize].testBit(weight)) continue;
                int difference = Math.abs(total - 2 * weight);
                if (difference < best) {
                    best = difference;
                    low = Math.min(weight, total - weight);
                }
            }
            if (tc > 0) answer.append('\n');
            answer.append(low).append(' ').append(total - low).append('\n');
        }
        System.out.print(answer);
    }
}
