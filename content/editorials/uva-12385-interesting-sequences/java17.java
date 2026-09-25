import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            int n = input.nextInt();
            int[] seen = new int[100001];
            int epoch = 1, answer = 0;
            for (int i = 0; i < n; ++i) {
                int value = input.nextInt();
                if (seen[value] == epoch) { ++answer; ++epoch; }
                seen[value] = epoch;
            }
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
