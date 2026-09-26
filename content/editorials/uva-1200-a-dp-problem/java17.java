import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens())tokens=new StringTokenizer(input.readLine());return tokens.nextToken();}
    static long[]parse(String text){
        long coefficient=0,constant=0;int i=0;
        while(i<text.length()){
            int sign=1;char ch=text.charAt(i);
            if(ch=='+'||ch=='-'){if(ch=='-')sign=-1;i++;}
            long value=0;boolean digits=false;
            while(i<text.length()&&text.charAt(i)>='0'&&text.charAt(i)<='9'){digits=true;value=value*10+text.charAt(i)-'0';i++;}
            if(i<text.length()&&text.charAt(i)=='x'){coefficient+=sign*(digits?value:1);i++;}else constant+=sign*value;
        }
        return new long[]{coefficient,constant};
    }
    public static void main(String[]args)throws Exception{
        int tests=Integer.parseInt(next());
        while(tests-->0){
            String[]sides=next().split("=");long[]left=parse(sides[0]),right=parse(sides[1]);
            long numerator=right[1]-left[1],denominator=left[0]-right[0];
            if(denominator==0)System.out.println(numerator==0?"IDENTITY":"IMPOSSIBLE");
            else System.out.println(Math.floorDiv(numerator,denominator));
        }
    }
}
