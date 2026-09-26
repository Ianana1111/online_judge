import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens()){String line=input.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}
    static class Matrix{BigInteger rows,columns;Matrix(BigInteger r,BigInteger c){rows=r;columns=c;}}
    public static void main(String[]args)throws Exception{
        int n=Integer.parseInt(next());Matrix[]dimensions=new Matrix[26];
        for(int i=0;i<n;i++){int name=next().charAt(0)-'A';dimensions[name]=new Matrix(new BigInteger(next()),new BigInteger(next()));}
        String expression;
        while((expression=next())!=null){
            Matrix[]stack=new Matrix[expression.length()+1];int size=0;boolean valid=true;BigInteger cost=BigInteger.ZERO;
            for(int i=0;i<expression.length();i++){
                char symbol=expression.charAt(i);if(symbol=='(')continue;
                if(symbol==')'){
                    Matrix right=stack[--size],left=stack[--size];
                    if(!left.columns.equals(right.rows)){valid=false;break;}
                    cost=cost.add(left.rows.multiply(left.columns).multiply(right.columns));stack[size++]=new Matrix(left.rows,right.columns);
                }else stack[size++]=dimensions[symbol-'A'];
            }
            System.out.println(valid?cost.toString():"error");
        }
    }
}
