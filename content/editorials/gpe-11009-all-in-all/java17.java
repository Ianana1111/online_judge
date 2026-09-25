import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNext()) {
            String shortText = input.next(), longText = input.next();
            int matched = 0;
            for (int i = 0; i < longText.length(); ++i)
                if (matched < shortText.length() && longText.charAt(i) == shortText.charAt(matched))
                    ++matched;
            output.append(matched == shortText.length() ? "Yes\n" : "No\n");
        }
        System.out.print(output);
    }
}
