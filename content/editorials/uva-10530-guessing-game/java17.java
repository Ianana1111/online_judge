import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        int low = 1, high = 10;
        while (input.hasNextInt()) {
            int guess = input.nextInt();
            if (guess == 0) break;
            String first = input.next(), second = input.next();
            if (first.equals("too") && second.equals("high")) {
                high = Math.min(high, guess - 1);
            } else if (first.equals("too") && second.equals("low")) {
                low = Math.max(low, guess + 1);
            } else {
                output.append(low <= guess && guess <= high ? "Stan may be honest\n" : "Stan is dishonest\n");
                low = 1;
                high = 10;
            }
        }
        System.out.print(output);
    }
}
