import java.io.BufferedInputStream;
class Main {
    public static void main(String[] args) throws Exception {
        String[] rows={"`1234567890-=", "QWERTYUIOP[]\\", "ASDFGHJKL;'", "ZXCVBNM,./"};
        char[] decode=new char[256];
        for(int i=0;i<256;++i) decode[i]=(char)i;
        for(String row:rows) for(int i=1;i<row.length();++i) decode[row.charAt(i)]=row.charAt(i-1);
        BufferedInputStream input=new BufferedInputStream(System.in);
        StringBuilder output=new StringBuilder();
        int ch;
        while((ch=input.read())!=-1) output.append(decode[ch]);
        System.out.print(output);
    }
}
