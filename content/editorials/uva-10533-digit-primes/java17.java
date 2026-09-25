import java.io.BufferedInputStream;
import java.io.IOException;

class Main {
    static final BufferedInputStream input = new BufferedInputStream(System.in);
    static int nextInt() throws IOException {
        int ch;
        do { ch = input.read(); } while (ch <= ' ' && ch != -1);
        int value = 0;
        while (ch > ' ') { value = value * 10 + ch - '0'; ch = input.read(); }
        return value;
    }
    public static void main(String[] args) throws IOException {
        int limit = 1000000;
        boolean[] prime = new boolean[limit];
        for (int i = 2; i < limit; ++i) prime[i] = true;
        for (int p = 2; p * p < limit; ++p)
            if (prime[p])
                for (int multiple = p * p; multiple < limit; multiple += p)
                    prime[multiple] = false;
        int[] prefix = new int[limit];
        for (int value = 1; value < limit; ++value) {
            int digitSum = 0;
            for (int rest = value; rest > 0; rest /= 10) digitSum += rest % 10;
            prefix[value] = prefix[value - 1] + (prime[value] && prime[digitSum] ? 1 : 0);
        }
        int queries = nextInt();
        StringBuilder output = new StringBuilder();
        for (int i = 0; i < queries; ++i) {
            int left = nextInt(), right = nextInt();
            output.append(prefix[right] - prefix[left - 1]).append('\n');
        }
        System.out.print(output);
    }
}
