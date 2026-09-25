import java.util.Scanner;

class Main {
    static long gcd(long a, long b) {
        while (b != 0) { long remainder = a % b; a = b; b = remainder; }
        return a;
    }
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        int caseNumber = 0;
        while (input.hasNextLong()) {
            long v1=input.nextLong(), d1=input.nextLong(), v2=input.nextLong(), d2=input.nextLong();
            if (v1==0 && d1==0 && v2==0 && d2==0) break;
            boolean captain = d1*v2 < d2*v1;
            long numerator=d1*v2+d2*v1, denominator=2*v1*v2;
            long divisor=gcd(numerator,denominator);
            numerator/=divisor;
            denominator/=divisor;
            output.append("Case #").append(++caseNumber).append(": ")
                  .append(captain ? "You owe me a beer!\n" : "No beer for the captain.\n");
            output.append("Avg. arrival time: ").append(numerator);
            if (denominator != 1) output.append('/').append(denominator);
            output.append('\n');
        }
        System.out.print(output);
    }
}
