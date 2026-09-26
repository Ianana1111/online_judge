import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;

public class Main {
    static boolean letter(char c){return c>='a'&&c<='z'||c>='A'&&c<='Z';}
    static boolean digit(char c){return c>='0'&&c<='9';}
    static int[] tree;
    static void update(int p,int delta){for(;p<tree.length;p+=p&-p)tree[p]+=delta;}
    static int kth(int k){int p=0;for(int step=Integer.highestOneBit(tree.length-1);step>0;step>>=1){int q=p+step;if(q<tree.length&&tree[q]<k){p=q;k-=tree[q];}}return p+1;}
    public static void main(String[] args)throws Exception{
        BufferedReader in=new BufferedReader(new InputStreamReader(System.in));StringBuilder input=new StringBuilder();String line;
        while((line=in.readLine())!=null&&!line.equals("0"))input.append(line).append('\n');
        String text=input.toString();int events=0;
        for(int i=0;i<text.length();){char c=text.charAt(i);if(letter(c)){events++;while(i<text.length()&&letter(text.charAt(i)))i++;}else if(digit(c)){events++;while(i<text.length()&&digit(text.charAt(i)))i++;}else i++;}
        tree=new int[events+1];String[] words=new String[events+1];int front=events+1;PrintWriter out=new PrintWriter(System.out);
        for(int i=0;i<text.length();){String word;int start=i;char c=text.charAt(i);
            if(letter(c)){while(i<text.length()&&letter(text.charAt(i)))i++;word=text.substring(start,i);}
            else if(digit(c)){int index=0;while(i<text.length()&&digit(text.charAt(i)))index=index*10+text.charAt(i++)-'0';int old=kth(index);word=words[old];words[old]=null;update(old,-1);}
            else {while(i<text.length()&&!letter(text.charAt(i))&&!digit(text.charAt(i)))i++;out.print(text.substring(start,i));continue;}
            words[--front]=word;update(front,1);out.print(word);
        }
        out.flush();
    }
}
