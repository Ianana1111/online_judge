import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            String digits = input.next()+input.next()+input.next()+input.next();
            int sum = 0;
            for (int i = 0; i < 16; ++i) {
                int value = digits.charAt(i)-'0';
                if (i % 2 == 0) {
                    value *= 2;
                    if (value > 9) value -= 9;
                }
                sum += value;
            }
            output.append(sum % 10 == 0 ? "Valid\n" : "Invalid\n");
        }
        System.out.print(output);
    }
}
