import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        boolean[] prime = new boolean[1000000];
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
            int answer = 0;
            for (int a = 3; a <= n / 2; a += 2)
                if (prime[a] && prime[n - a]) { answer = a; break; }
            if (answer > 0) output.append(n).append(" = ").append(answer)
                                  .append(" + ").append(n - answer).append('\n');
            else output.append("Goldbach's conjecture is wrong.\n");
        }
        System.out.print(output);
    }
}
