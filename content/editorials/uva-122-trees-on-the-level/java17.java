import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.ArrayDeque;
import java.util.ArrayList;
public class Main {
 static final class Node {int left=-1,right=-1;String value;}
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  String next()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return null;StringBuilder word=new StringBuilder();while(c>32){word.append((char)c);c=read();}return word.toString();}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();ArrayList<Node> nodes=new ArrayList<>();nodes.add(new Node());StringBuilder out=new StringBuilder();boolean valid=true;String token;
  while((token=fs.next())!=null){
   if(token.equals("()")){
    ArrayDeque<Integer> pending=new ArrayDeque<>();ArrayList<String> answer=new ArrayList<>();pending.add(0);
    while(!pending.isEmpty()){Node node=nodes.get(pending.remove());if(node.value==null)valid=false;
     answer.add(node.value);if(node.left>=0)pending.add(node.left);if(node.right>=0)pending.add(node.right);
    }
    if(!valid)out.append("not complete\n");
    else{for(int i=0;i<answer.size();i++){if(i>0)out.append(' ');out.append(answer.get(i));}out.append('\n');}
    nodes.clear();nodes.add(new Node());valid=true;continue;
   }
   int comma=token.indexOf(',');String value=token.substring(1,comma).replaceFirst("^0+","");int at=0;
   for(int i=comma+1;i<token.length()-1;i++){
    Node node=nodes.get(at);boolean right=token.charAt(i)=='R';int next=right?node.right:node.left;
    if(next<0){next=nodes.size();nodes.add(new Node());if(right)node.right=next;else node.left=next;}at=next;
   }
   if(nodes.get(at).value!=null)valid=false;nodes.get(at).value=value;
  }
  System.out.print(out);
 }
}
