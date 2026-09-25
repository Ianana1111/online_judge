import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        int[] digits = new int[3000];
        int[] sums = new int[1001];
        digits[0] = 1;
        sums[0] = 1;
        int length = 1;
        for (int n = 1; n <= 1000; ++n) {
            int carry = 0;
            for (int i = 0; i < length; ++i) {
                int product = digits[i] * n + carry;
                digits[i] = product % 10;
                carry = product / 10;
            }
            while (carry != 0) {
                digits[length++] = carry % 10;
                carry /= 10;
            }
            for (int i = 0; i < length; ++i) sums[n] += digits[i];
        }
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) output.append(sums[input.nextInt()]).append('\n');
        System.out.print(output);
    }
}
