import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            String answer = input.next();
            int streak = 0;
            int total = 0;
            for (int i = 0; i < answer.length(); ++i) {
                if (answer.charAt(i) == 'O') {
                    ++streak;
                    total += streak;
                } else {
                    streak = 0;
                }
            }
            output.append(total).append('\n');
        }
        System.out.print(output);
    }
}
