import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 1; caseNumber <= tests; ++caseNumber) {
            String[] urls = new String[10];
            int[] scores = new int[10];
            int best = -1;
            for (int i = 0; i < 10; ++i) {
                urls[i] = input.next();
                scores[i] = input.nextInt();
                best = Math.max(best, scores[i]);
            }
            output.append("Case #").append(caseNumber).append(":\n");
            for (int i = 0; i < 10; ++i) {
                if (scores[i] == best) output.append(urls[i]).append('\n');
            }
        }
        System.out.print(output);
    }
}
