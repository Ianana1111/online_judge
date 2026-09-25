import java.util.Scanner;

class Main {
    static int digitSum(int value) {
        int total = 0;
        while (value > 0) { total += value % 10; value /= 10; }
        return total;
    }
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNext()) {
            String number = input.next();
            if (number.equals("0")) break;
            int total = 0;
            for (int i = 0; i < number.length(); ++i) total += number.charAt(i) - '0';
            if (total % 9 != 0) {
                output.append(number).append(" is not a multiple of 9.\n");
            } else {
                int degree = 1;
                while (total != 9) { total = digitSum(total); ++degree; }
                output.append(number).append(" is a multiple of 9 and has 9-degree ")
                      .append(degree).append(".\n");
            }
        }
        System.out.print(output);
    }
}
