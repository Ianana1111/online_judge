import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            int n = input.nextInt();
            int[] count = new int[10];
            for (int value = 1; value <= n; ++value) {
                for (int x = value; x > 0; x /= 10) ++count[x % 10];
            }
            for (int digit = 0; digit < 10; ++digit) {
                if (digit > 0) output.append(' ');
                output.append(count[digit]);
            }
            output.append('\n');
        }
        System.out.print(output);
    }
}
