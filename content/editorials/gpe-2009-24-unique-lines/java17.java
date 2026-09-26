import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.HashSet;
import java.util.Set;
import java.util.StringTokenizer;

public class Main {
    static BufferedReader in=new BufferedReader(new InputStreamReader(System.in));static StringTokenizer tokens=new StringTokenizer("");
    static String word()throws Exception{while(!tokens.hasMoreTokens())tokens=new StringTokenizer(in.readLine());return tokens.nextToken();}
    public static void main(String[] args)throws Exception{int cases=Integer.parseInt(word());while(cases-->0){int n=Integer.parseInt(word());BigInteger[] x=new BigInteger[n],y=new BigInteger[n];for(int i=0;i<n;i++){x[i]=new BigInteger(word());y[i]=new BigInteger(word());}Set<String> lines=new HashSet<>();for(int i=0;i<n;i++)for(int j=0;j<i;j++){BigInteger a=y[j].subtract(y[i]),b=x[i].subtract(x[j]),c=a.multiply(x[i]).add(b.multiply(y[i])).negate(),d=a.gcd(b).gcd(c);a=a.divide(d);b=b.divide(d);c=c.divide(d);if(a.signum()<0||a.signum()==0&&b.signum()<0){a=a.negate();b=b.negate();c=c.negate();}lines.add(a+","+b+","+c);}System.out.println(lines.size());}}
}
