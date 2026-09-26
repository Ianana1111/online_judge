import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.StringTokenizer;
public class Main {
    public static void main(String[]args)throws Exception{
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));String line;
        while((line=input.readLine())!=null){
            StringTokenizer tokens=new StringTokenizer(line);if(!tokens.hasMoreTokens())continue;
            BigInteger first=new BigInteger(tokens.nextToken());if(first.signum()==0&&!tokens.hasMoreTokens())break;
            BigInteger answer=BigInteger.ZERO;
            while(tokens.hasMoreTokens()){
                BigInteger value=new BigInteger(tokens.nextToken());if(value.signum()==0)break;
                answer=answer.gcd(value.subtract(first).abs());
            }
            System.out.println(answer);
        }
    }
}
