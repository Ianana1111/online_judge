import java.util.Locale;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNext()) {
            String[] parts = input.next().split(":");
            int hour = Integer.parseInt(parts[0]);
            int minute = Integer.parseInt(parts[1]);
            if (hour == 0 && minute == 0) break;
            int twiceAngle = Math.abs(60 * (hour % 12) + minute - 12 * minute);
            twiceAngle = Math.min(twiceAngle, 720 - twiceAngle);
            output.append(String.format(Locale.US, "%.3f%n", twiceAngle / 2.0));
        }
        System.out.print(output);
    }
}
