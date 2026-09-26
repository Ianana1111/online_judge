import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens())tokens=new StringTokenizer(input.readLine());return tokens.nextToken();}
    public static void main(String[]args)throws Exception{
        int tests=Integer.parseInt(next());StringBuilder out=new StringBuilder();
        for(int test=0;test<tests;test++){if(test!=0)out.append('\n');out.append(new BigInteger(next()).sqrt()).append('\n');}
        System.out.print(out);
    }
}
