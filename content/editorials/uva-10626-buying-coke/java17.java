import java.io.BufferedInputStream;
import java.io.IOException;

public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }

    static int minimumCoins(int cokes, int fives, int tens) {
        int used = Math.min(cokes, tens), remaining = cokes - used;
        int converted = Math.min(used, Math.max(0, remaining - fives));
        fives += converted;
        int other;
        if (fives <= remaining) other = 8 * remaining - 4 * fives;
        else if (fives <= 2 * remaining) other = 6 * remaining - 2 * fives;
        else other = 2 * remaining;
        return used + 3 * converted + other;
    }

    public static void main(String[] args) throws Exception {
        FastScanner input = new FastScanner();
        int tests = input.nextInt();
        StringBuilder out = new StringBuilder();
        while (tests-- > 0) {
            int cokes = input.nextInt();
            input.nextInt(); // Sufficient total value is guaranteed by the problem.
            int fives = input.nextInt(), tens = input.nextInt();
            out.append(minimumCoins(cokes, fives, tens)).append('\n');
        }
        System.out.print(out);
    }
}
