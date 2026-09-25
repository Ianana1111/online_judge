import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextLong()) {
            long n = input.nextLong();
            if (n == 0) break;
            long remaining = n, answer = n;
            for (long prime = 2; prime * prime <= remaining; ++prime) {
                if (remaining % prime != 0) continue;
                answer -= answer / prime;
                while (remaining % prime == 0) remaining /= prime;
            }
            if (remaining > 1) answer -= answer / remaining;
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
