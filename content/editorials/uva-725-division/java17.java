import java.util.Scanner;
class Main {
    static boolean uniqueDigits(int numerator,int denominator) {
        int used=0;
        for(int part=0;part<2;++part) {
            int value=part==0?numerator:denominator;
            for(int i=0;i<5;++i) {
                int bit=1<<(value%10);value/=10;
                if((used&bit)!=0) return false;
                used|=bit;
            }
        }
        return used==(1<<10)-1;
    }
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();boolean first=true;
        while(input.hasNextInt()) {
            int n=input.nextInt();if(n==0) break;
            if(!first) output.append('\n');first=false;boolean found=false;
            for(int denominator=1234;denominator*n<=98765;++denominator) {
                int numerator=denominator*n;
                if(!uniqueDigits(numerator,denominator)) continue;
                found=true;
                output.append(String.format("%05d / %05d = %d\n",numerator,denominator,n));
            }
            if(!found) output.append("There are no solutions for ").append(n).append(".\n");
        }
        System.out.print(output);
    }
}
