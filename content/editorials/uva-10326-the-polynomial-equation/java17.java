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
            int n=Integer.parseInt(token);BigInteger[]coefficient={BigInteger.ONE};
            for(int count=0;count<n;count++){
                BigInteger root=new BigInteger(next());BigInteger[]updated=new BigInteger[count+2];
                for(int degree=0;degree<=count+1;degree++){
                    BigInteger left=degree>0?coefficient[degree-1]:BigInteger.ZERO;
                    BigInteger product=degree<=count?root.multiply(coefficient[degree]):BigInteger.ZERO;
                    updated[degree]=left.subtract(product);
                }
                coefficient=updated;
            }
            StringBuilder answer=new StringBuilder();
            for(int degree=n;degree>=0;degree--){
                BigInteger value=coefficient[degree],magnitude=value.abs();if(degree>0&&value.signum()==0)continue;
                if(answer.length()>0)answer.append(value.signum()<0?" - ":" + ");
                if(degree==0)answer.append(magnitude);
                else{if(!magnitude.equals(BigInteger.ONE))answer.append(magnitude);answer.append('x');if(degree>1)answer.append('^').append(degree);}
            }
            System.out.println(answer.append(" = 0"));
        }
    }
}
