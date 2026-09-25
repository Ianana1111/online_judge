import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 1; caseNumber <= tests; ++caseNumber) {
            int a=input.nextInt(), b=input.nextInt(), c=input.nextInt(), d=input.nextInt();
            int e=input.nextInt(), f=input.nextInt(), g=input.nextInt(), h=input.nextInt();
            int areaA=(c-a)*(d-b), areaB=(g-e)*(h-f);
            int width=Math.max(0,Math.min(c,g)-Math.max(a,e));
            int height=Math.max(0,Math.min(d,h)-Math.max(b,f));
            int strong=width*height;
            int weak=areaA+areaB-2*strong;
            int none=10000-strong-weak;
            output.append("Night ").append(caseNumber).append(": ")
                  .append(strong).append(' ').append(weak).append(' ').append(none).append('\n');
        }
        System.out.print(output);
    }
}
