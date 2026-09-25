import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        int limit = 1299709;
        boolean[] prime = new boolean[limit + 1];
        for (int i = 2; i <= limit; ++i) prime[i] = true;
        for (int p = 2; p * p <= limit; ++p)
            if (prime[p])
                for (int multiple = p * p; multiple <= limit; multiple += p)
                    prime[multiple] = false;
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt();
            if (n == 0) break;
            if (prime[n]) { output.append("0\n"); continue; }
            int lower = n - 1, upper = n + 1;
            while (!prime[lower]) --lower;
            while (!prime[upper]) ++upper;
            output.append(upper - lower).append('\n');
        }
        System.out.print(output);
    }
}
