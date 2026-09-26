import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.HashSet;
import java.util.Set;
import java.util.StringTokenizer;
public class Main {
    static Set<BigInteger> parse(String line) {
        Set<BigInteger> result=new HashSet<>();StringTokenizer tokens=new StringTokenizer(line);
        while(tokens.hasMoreTokens())result.add(new BigInteger(tokens.nextToken()));return result;
    }
    public static void main(String[] args)throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));String left;
        while((left=input.readLine())!=null) {
            String right=input.readLine();if(right==null)break;
            Set<BigInteger> a=parse(left),b=parse(right);int common=0;
            for(BigInteger item:a)if(b.contains(item))common++;
            if(common==a.size()&&common==b.size())System.out.println("A equals B");
            else if(common==a.size())System.out.println("A is a proper subset of B");
            else if(common==b.size())System.out.println("B is a proper subset of A");
            else if(common==0)System.out.println("A and B are disjoint");
            else System.out.println("I'm confused!");
        }
    }
}
