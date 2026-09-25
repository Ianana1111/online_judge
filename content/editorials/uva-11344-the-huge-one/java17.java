import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            String number = input.next();
            int count = input.nextInt();
            int[] divisors = new int[count];
            for (int i = 0; i < count; ++i) divisors[i] = input.nextInt();
            boolean wonderful = true;
            for (int divisor : divisors) {
                int remainder = 0;
                for (int j = 0; j < number.length(); ++j)
                    remainder = (10 * remainder + number.charAt(j) - '0') % divisor;
                if (remainder != 0) wonderful = false;
            }
            output.append(number).append(wonderful ? " - Wonderful.\n" : " - Simple.\n");
        }
        System.out.print(output);
    }
}
