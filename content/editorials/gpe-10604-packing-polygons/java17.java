import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Random;
import java.util.StringTokenizer;

public class Main {
    static BufferedReader in=new BufferedReader(new InputStreamReader(System.in));static StringTokenizer tokens=new StringTokenizer("");
    static String word()throws Exception{while(!tokens.hasMoreTokens()){String line=in.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}
    static class Point{BigInteger x,y;Point(BigInteger x,BigInteger y){this.x=x;this.y=y;}}
    static class Circle{BigInteger x,y,d,r;Circle(BigInteger x,BigInteger y,BigInteger d,BigInteger r){this.x=x;this.y=y;this.d=d;this.r=r;}}
    static BigInteger squared(BigInteger x,BigInteger y){return x.multiply(x).add(y.multiply(y));}
    static Circle single(Point p){return new Circle(p.x,p.y,BigInteger.ONE,BigInteger.ZERO);}
    static Circle diameter(Point a,Point b){return new Circle(a.x.add(b.x),a.y.add(b.y),BigInteger.TWO,squared(a.x.subtract(b.x),a.y.subtract(b.y)));}
    static boolean outside(Circle c,Point p){return squared(p.x.multiply(c.d).subtract(c.x),p.y.multiply(c.d).subtract(c.y)).compareTo(c.r)>0;}
    static Circle throughThree(Point a,Point b,Point c){BigInteger ux=b.x.subtract(a.x),uy=b.y.subtract(a.y),vx=c.x.subtract(a.x),vy=c.y.subtract(a.y),d=ux.multiply(vy).subtract(uy.multiply(vx)).multiply(BigInteger.TWO);if(d.signum()==0){Circle best=diameter(a,b),next=diameter(a,c);if(next.r.compareTo(best.r)>0)best=next;next=diameter(b,c);if(next.r.compareTo(best.r)>0)best=next;return best;}BigInteger u2=squared(ux,uy),v2=squared(vx,vy),dx=u2.multiply(vy).subtract(v2.multiply(uy)),dy=ux.multiply(v2).subtract(vx.multiply(u2)),x=a.x.multiply(d).add(dx),y=a.y.multiply(d).add(dy),r=squared(dx,dy);if(d.signum()<0){d=d.negate();x=x.negate();y=y.negate();}return new Circle(x,y,d,r);}
    public static void main(String[] args)throws Exception{String token;while((token=word())!=null){int n=Integer.parseInt(token);if(n==0)break;Point[] points=new Point[n];for(int i=0;i<n;i++)points[i]=new Point(new BigInteger(word()),new BigInteger(word()));BigDecimal radius=new BigDecimal(word());BigInteger rn=radius.unscaledValue().abs(),rd=BigInteger.ONE;if(radius.scale()>=0)rd=BigInteger.TEN.pow(radius.scale());else rn=rn.multiply(BigInteger.TEN.pow(-radius.scale()));Random random=new Random(10005);for(int i=n-1;i>0;i--){int j=random.nextInt(i+1);Point swap=points[i];points[i]=points[j];points[j]=swap;}Circle circle=single(points[0]);for(int i=1;i<n;i++){if(!outside(circle,points[i]))continue;circle=single(points[i]);for(int j=0;j<i;j++){if(!outside(circle,points[j]))continue;circle=diameter(points[i],points[j]);for(int k=0;k<j;k++)if(outside(circle,points[k]))circle=throughThree(points[i],points[j],points[k]);}}boolean possible=circle.r.multiply(rd).multiply(rd).compareTo(rn.multiply(rn).multiply(circle.d).multiply(circle.d))<=0;System.out.println(possible?"The polygon can be packed in the circle.":"There is no way of packing that polygon.");}}
}
