import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  String next()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return null;
   StringBuilder s=new StringBuilder();while(c>32&&c>=0){s.append((char)c);c=read();}return s.toString();}
  int nextInt()throws IOException{return Integer.parseInt(next());}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();int[]owner=new int[1000000];StringBuilder out=new StringBuilder();int scenario=0,teams;
  while((teams=fs.nextInt())!=0){
   @SuppressWarnings("unchecked") ArrayDeque<Integer>[]groups=new ArrayDeque[teams];
   for(int team=0;team<teams;team++){
    groups[team]=new ArrayDeque<>();int count=fs.nextInt();
    while(count-->0)owner[fs.nextInt()]=team;
   }
   ArrayDeque<Integer>active=new ArrayDeque<>();out.append("Scenario #").append(++scenario).append('\n');
   String command;
   while(!(command=fs.next()).equals("STOP")){
    if(command.equals("ENQUEUE")){
     int member=fs.nextInt(),team=owner[member];
     if(groups[team].isEmpty())active.addLast(team);
     groups[team].addLast(member);
    }else{
     int team=active.peekFirst();out.append(groups[team].removeFirst()).append('\n');
     if(groups[team].isEmpty())active.removeFirst();
    }
   }
   out.append('\n');
  }
  System.out.print(out);
 }
}
