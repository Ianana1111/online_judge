import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextLong()) {
            long difference = input.nextLong();
            if (difference == 0) break;
            long quotient = difference / 9;
            long remainder = difference % 9;
            if (remainder == 0) {
                output.append(10 * quotient - 1).append(' ').append(10 * quotient);
            } else {
                output.append(10 * quotient + remainder);
            }
            output.append('\n');
        }
        System.out.print(output);
    }
}
