import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            long n = input.nextLong();
            if (n <= 0) { output.append("0\n"); continue; }
            long low = 1, high = 46340;
            while (low < high) {
                long mid = (low + high + 1) / 2;
                if (mid * mid <= n) low = mid;
                else high = mid - 1;
            }
            long root = low, sum = 0;
            for (long i = 1; i <= root; ++i) sum += n / i;
            output.append(2 * sum - root * root).append('\n');
        }
        System.out.print(output);
    }
}
