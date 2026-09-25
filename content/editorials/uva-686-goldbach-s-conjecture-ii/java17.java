import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        boolean[] prime = new boolean[32768];
        for (int i = 2; i < prime.length; ++i) prime[i] = true;
        for (int p = 2; p * p < prime.length; ++p)
            if (prime[p])
                for (int multiple = p * p; multiple < prime.length; multiple += p)
                    prime[multiple] = false;
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt();
            if (n == 0) break;
            int count = 0;
            for (int p = 2; p <= n / 2; ++p)
                if (prime[p] && prime[n - p]) ++count;
            output.append(count).append('\n');
        }
        System.out.print(output);
    }
}
