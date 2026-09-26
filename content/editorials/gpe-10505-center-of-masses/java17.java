import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Comparator;
import java.util.StringTokenizer;

public class Main {
    static BufferedReader in=new BufferedReader(new InputStreamReader(System.in));static StringTokenizer tokens=new StringTokenizer("");
    static String word()throws Exception{while(!tokens.hasMoreTokens()){String line=in.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}
    static class Point{BigInteger x,y;Point(BigInteger x,BigInteger y){this.x=x;this.y=y;}}
    static BigInteger cross(Point a,Point b,Point c){return b.x.subtract(a.x).multiply(c.y.subtract(a.y)).subtract(b.y.subtract(a.y).multiply(c.x.subtract(a.x)));}
    static String fixed(BigInteger numerator,BigInteger denominator){boolean negative=numerator.signum()*denominator.signum()<0;denominator=denominator.abs();BigInteger rounded=numerator.abs().multiply(BigInteger.valueOf(2000)).add(denominator).divide(denominator.multiply(BigInteger.TWO));if(rounded.signum()==0)negative=false;BigInteger[] parts=rounded.divideAndRemainder(BigInteger.valueOf(1000));return(negative?"-":"")+parts[0]+String.format(".%03d",parts[1].intValue());}
    public static void main(String[] args)throws Exception{String token;while((token=word())!=null){int n=Integer.parseInt(token);if(n<3)break;Point[] points=new Point[n],hull=new Point[2*n];for(int i=0;i<n;i++)points[i]=new Point(new BigInteger(word()),new BigInteger(word()));Arrays.sort(points,Comparator.comparing((Point p)->p.x).thenComparing(p->p.y));int size=0;for(Point p:points){while(size>=2&&cross(hull[size-2],hull[size-1],p).signum()<=0)size--;hull[size++]=p;}int threshold=size+1;for(int i=n-2;i>=0;i--){Point p=points[i];while(size>=threshold&&cross(hull[size-2],hull[size-1],p).signum()<=0)size--;hull[size++]=p;}size--;BigInteger area=BigInteger.ZERO,mx=BigInteger.ZERO,my=BigInteger.ZERO;for(int i=0;i<size;i++){Point a=hull[i],b=hull[(i+1)%size];BigInteger weight=a.x.multiply(b.y).subtract(a.y.multiply(b.x));area=area.add(weight);mx=mx.add(a.x.add(b.x).multiply(weight));my=my.add(a.y.add(b.y).multiply(weight));}BigInteger denominator=area.multiply(BigInteger.valueOf(3));System.out.println(fixed(mx,denominator)+" "+fixed(my,denominator));}}
}
