import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in); StringBuilder output=new StringBuilder("PERFECTION OUTPUT\n");
        while(input.hasNextInt()) {
            int n=input.nextInt(); if(n==0) break;
            int total=n==1?0:1;
            for(int divisor=2;divisor*divisor<=n;++divisor) if(n%divisor==0) {
                total+=divisor; int pair=n/divisor;
                if(pair!=divisor) total+=pair;
            }
            String kind=total==n?"PERFECT":total>n?"ABUNDANT":"DEFICIENT";
            output.append(String.format("%5d  %s\n",n,kind));
        }
        output.append("END OF OUTPUT\n");
        System.out.print(output);
    }
}
