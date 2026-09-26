import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class Main {
    static char decode(char c,int shift){return (char)('A'+(c-'A'-shift+26)%26);}
    static String decodeMessage(String key,int shift,String message){boolean[] present=new boolean[26];for(char c:key.toCharArray())present[c-'A']=true;StringBuilder out=new StringBuilder();int at=0,position=0;
        while(at<message.length()){char c=message.charAt(at);if(c==' '){out.append(c);at++;continue;}boolean wrapped=!key.isEmpty()&&at+2<message.length()&&message.charAt(at+1)!=' '&&message.charAt(at+2)!=' '&&c==key.charAt(position)&&message.charAt(at+2)==key.charAt((position+1)%key.length())&&present[decode(message.charAt(at+1),shift)-'A'];
            if(wrapped){out.append(decode(message.charAt(at+1),shift));position=(position+1)%key.length();at+=3;}else{char plain=decode(c,shift);if(present[plain-'A'])return "error in encryption";out.append(plain);at++;}}
        return out.toString();
    }
    public static void main(String[] args)throws Exception{BufferedReader in=new BufferedReader(new InputStreamReader(System.in));List<String> lines=new ArrayList<>();String line;while((line=in.readLine())!=null)lines.add(line);if(lines.isEmpty())return;int tests=Integer.parseInt(lines.get(0).trim()),at=1;
        for(int tc=0;tc<tests;tc++){while(at<lines.size()&&lines.get(at).trim().isEmpty()&&(at+1==lines.size()||!lines.get(at+1).trim().matches("[0-9]+")))at++;String key=lines.get(at++).trim();int shift=Integer.parseInt(lines.get(at++).trim()),count=Integer.parseInt(lines.get(at++).trim());if(tc>0)System.out.println();for(int i=0;i<count;i++)System.out.println(decodeMessage(key,shift,lines.get(at++)));}
    }
}
