import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            int blocks = input.nextInt();
            int answer = 6 * blocks;
            for (int a = 1; a * a * a <= blocks; ++a) {
                if (blocks % a != 0) continue;
                for (int b = a; b * b <= blocks / a; ++b) {
                    if ((blocks / a) % b != 0) continue;
                    int c = blocks / a / b;
                    answer = Math.min(answer, 2 * (a*b + b*c + c*a));
                }
            }
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
