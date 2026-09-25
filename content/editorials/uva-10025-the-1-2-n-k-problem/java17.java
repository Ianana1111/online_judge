import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            long target = Math.abs(input.nextLong());
            long n = 0, sum = 0;
            while (n == 0 || sum < target || (sum - target) % 2 != 0) {
                ++n;
                sum += n;
            }
            if (caseNumber > 0) output.append('\n');
            output.append(n).append('\n');
        }
        System.out.print(output);
    }
}
