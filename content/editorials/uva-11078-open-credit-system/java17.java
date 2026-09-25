import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            int n = input.nextInt();
            int highest = input.nextInt();
            int answer = Integer.MIN_VALUE;
            for (int i = 1; i < n; ++i) {
                int current = input.nextInt();
                answer = Math.max(answer, highest - current);
                highest = Math.max(highest, current);
            }
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
