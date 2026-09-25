import java.util.Scanner;
class Main {
    static boolean prime(int n) {
        if(n<2) return false;
        for(int divisor=2;divisor*divisor<=n;++divisor) if(n%divisor==0) return false;
        return true;
    }
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNextInt()) {
            int n=input.nextInt(),reversed=0;
            for(int rest=n;rest>0;rest/=10) reversed=reversed*10+rest%10;
            String kind=!prime(n)?"not prime":reversed!=n && prime(reversed)?"emirp":"prime";
            output.append(n).append(" is ").append(kind).append(".\n");
        }
        System.out.print(output);
    }
}
