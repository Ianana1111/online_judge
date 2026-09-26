import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens()){String line=input.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}
    public static void main(String[]args)throws Exception{
        String token;
        while((token=next())!=null){
            BigInteger a=new BigInteger(token),b=new BigInteger(next());
            if(b.signum()<0){a=a.negate();b=b.negate();}
            StringBuilder answer=new StringBuilder("[");int index=0;
            while(b.signum()!=0){
                BigInteger[]qr=a.divideAndRemainder(b);
                if(qr[1].signum()<0){qr[0]=qr[0].subtract(BigInteger.ONE);qr[1]=qr[1].add(b);}
                if(index>1)answer.append(',');answer.append(qr[0]);if(index==0)answer.append(';');
                a=b;b=qr[1];index++;
            }
            System.out.println(answer.append(']'));
        }
    }
}
