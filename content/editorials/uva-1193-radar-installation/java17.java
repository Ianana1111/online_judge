import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

public class Main {
    static BufferedReader in=new BufferedReader(new InputStreamReader(System.in));static StringTokenizer tokens=new StringTokenizer("");
    static String word()throws Exception{while(!tokens.hasMoreTokens()){String line=in.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}

    static class Endpoint{
        BigInteger center,square;int side;double lower,upper;
        Endpoint(BigInteger center,int side,BigInteger square){this.center=center;this.side=side;this.square=square;double c=center.doubleValue(),b=square.doubleValue();lower=Double.NEGATIVE_INFINITY;upper=Double.POSITIVE_INFINITY;if(!Double.isFinite(c)||!Double.isFinite(b))return;double cl=Math.nextDown(c),cu=Math.nextUp(c),rl=Math.nextDown(Math.sqrt(Math.max(0,Math.nextDown(b)))),ru=Math.nextUp(Math.sqrt(Math.nextUp(b)));lower=Math.nextDown(side>0?cl+rl:cl-ru);upper=Math.nextUp(side>0?cu+ru:cu-rl);}
    }
    static class Interval{Endpoint left,right;Interval(BigInteger center,BigInteger square){left=new Endpoint(center,-1,square);right=new Endpoint(center,1,square);}}
    static int oneRoot(BigInteger constant,BigInteger coefficient,BigInteger square){int a=constant.signum(),b=coefficient.signum();if(b==0||square.signum()==0)return a;if(a==0||a==b)return b;return a*constant.multiply(constant).subtract(coefficient.multiply(coefficient).multiply(square)).signum();}
    static int compare(Endpoint a,Endpoint b){if(a.upper<b.lower)return -1;if(a.lower>b.upper)return 1;BigInteger constant=a.center.subtract(b.center);int first=oneRoot(constant,BigInteger.valueOf(a.side),a.square),rightSign=-b.side;if(b.square.signum()==0)return first;if(first==0||first==rightSign)return rightSign;BigInteger base=constant.multiply(constant).add(a.square).subtract(b.square),coefficient=constant.multiply(BigInteger.valueOf(2*a.side));return first*oneRoot(base,coefficient,a.square);}

    public static void main(String[] args)throws Exception{String token;int tc=0;while((token=word())!=null){int n=Integer.parseInt(token);BigInteger radius=new BigInteger(word());if(n==0&&radius.signum()==0)break;BigInteger rr=radius.multiply(radius);List<Interval> intervals=new ArrayList<>();boolean possible=radius.signum()>=0;for(int i=0;i<n;i++){BigInteger x=new BigInteger(word()),y=new BigInteger(word()),square=rr.subtract(y.multiply(y));if(square.signum()<0)possible=false;else intervals.add(new Interval(x,square));}int answer=-1;if(possible){intervals.sort((a,b)->compare(a.right,b.right));answer=0;Endpoint position=null;for(Interval interval:intervals)if(position==null||compare(interval.left,position)>0){position=interval.right;answer++;}}System.out.println("Case "+(++tc)+": "+answer);}}
}
