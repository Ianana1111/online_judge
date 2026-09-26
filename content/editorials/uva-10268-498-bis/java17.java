import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
public class Main {
    public static void main(String[]args)throws Exception{
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));String line;
        while((line=input.readLine())!=null){
            if(line.trim().isEmpty())continue;
            BigInteger x=new BigInteger(line.trim());String[]coefficient=input.readLine().trim().split("\\s+");
            int degree=coefficient.length-1;BigInteger value=BigInteger.ZERO;
            for(int i=0;i<degree;i++)value=value.multiply(x).add(new BigInteger(coefficient[i]).multiply(BigInteger.valueOf(degree-i)));
            System.out.println(value);
        }
    }
}
