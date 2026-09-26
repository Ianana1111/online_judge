import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.ArrayDeque;
public class Main {
    static String evaluate(String line){
        if(line.trim().isEmpty())return "illegal";
        String[]tokens=line.trim().split("\\s+");ArrayDeque<BigInteger>stack=new ArrayDeque<>();
        for(int i=tokens.length-1;i>=0;i--){
            String token=tokens[i];
            if(token.matches("[0-9]+")){
                BigInteger value=new BigInteger(token);if(value.signum()==0)return "illegal";stack.push(value);continue;
            }
            if(token.length()!=1||"+-*/%".indexOf(token.charAt(0))<0||stack.size()<2)return "illegal";
            BigInteger a=stack.pop(),b=stack.pop(),result;char op=token.charAt(0);
            if(op=='+')result=a.add(b);
            else if(op=='-')result=a.subtract(b);
            else if(op=='*')result=a.multiply(b);
            else{if(b.signum()==0)return "illegal";result=op=='/'?a.divide(b):a.remainder(b);}
            stack.push(result);
        }
        return stack.size()==1?stack.pop().toString():"illegal";
    }
    public static void main(String[]args)throws Exception{
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));String line;
        while((line=input.readLine())!=null&&!line.equals("."))System.out.println(evaluate(line));
    }
}
