import java.math.BigInteger;
import java.util.Scanner;
class Main {
    static final long MOD=1000000009L;
    static long power(long base,long exponent) {
        long result=1;
        while(exponent>0) {
            if((exponent&1)!=0) result=result*base%MOD;
            base=base*base%MOD;exponent>>=1;
        }
        return result;
    }
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNext()) {
            long n=new BigInteger(input.next()).longValue();
            output.append((power(3,n)-2+MOD)%MOD).append('\n');
        }
        System.out.print(output);
    }
}
