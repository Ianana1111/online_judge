import java.util.Locale;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextDouble()) {
            double side = input.nextDouble();
            double square = side * side;
            double root3 = Math.sqrt(3);
            double striped = square * (1 - root3 + Math.PI / 3);
            double dotted = square * (2 * root3 - 4 + Math.PI / 3);
            double rest = square * (4 - root3 - 2 * Math.PI / 3);
            output.append(String.format(Locale.US, "%.3f %.3f %.3f%n", striped, dotted, rest));
        }
        System.out.print(output);
    }
}
