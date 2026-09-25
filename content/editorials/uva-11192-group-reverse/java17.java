import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int groups = input.nextInt();
            if (groups == 0) break;
            String text = input.next();
            int size = text.length() / groups;
            for (int start = 0; start < text.length(); start += size) {
                output.append(new StringBuilder(text.substring(start, start + size)).reverse());
            }
            output.append('\n');
        }
        System.out.print(output);
    }
}
