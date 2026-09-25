import java.util.Scanner;

public class Main {
    static int countBits(int value) {
        int count = 0;
        while (value > 0) {
            count += value % 2;
            value /= 2;
        }
        return count;
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        for (int test = 0; test < tests; ++test) {
            String digits = input.next();
            int decimal = 0, hexadecimal = 0;
            for (int i = 0; i < digits.length(); ++i) {
                int digit = digits.charAt(i) - '0';
                decimal = decimal * 10 + digit;
                hexadecimal = hexadecimal * 16 + digit;
            }
            System.out.println(countBits(decimal) + " " + countBits(hexadecimal));
        }
    }
}
